/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  AutoEmbedOption,
  LexicalAutoEmbedPlugin,
  URL_MATCHER,
} from '@lexical/react/LexicalAutoEmbedPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useMemo, useState } from 'react'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import useModal from '../../hooks/useModal.tsx'
import Button from '../../ui/Button.tsx'
import { DialogActions, DialogButtonsList } from '../../ui/Dialog.tsx'
import { INSERT_YOUTUBE_COMMAND } from '../YouTubePlugin/index.ts'
import { message, Upload } from 'antd'
import { INSERT_VIDEO_COMMAND } from '../Video/index.ts'
import { UploadOutlined } from '@ant-design/icons'
import PresignedUrl from '../../../MessageBoard/PresignedUrl.jsx'
import { getBase64 } from '../Document/DocumentPlugin.js'
import './index.css'

export const YoutubeEmbedConfig = {
  contentName: 'Video',
  exampleUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
  icon: <i className="icon youtube" />,
  insertNode: (editor, result) => {
    if (result?.type === 'youtube-video') {
      editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, result?.id)
    } else if (result?.type === 'normal-video') {
      editor.dispatchCommand(INSERT_VIDEO_COMMAND, result?.id)
    } else {
      return null
    }
  },
  keywords: ['youtube', 'video'],
  parseUrl: async (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    const normalVideoRegex =
      /^(https?:\/\/)?[a-zA-Z0-9\-\.]+\/[^\s]+(\.mp4|\.avi|\.mov|\.wmv|\.flv|\.webm|\.mkv)(\?.*)?$/

    let type = ''

    if (url) {
      type = youtubeRegex.test(url)
        ? 'youtube-video'
        : normalVideoRegex.test(url)
          ? 'normal-video'
          : ''
    }

    if (type === 'youtube-video') {
      const youtubeMatch =
        /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/.exec(
          url
        )

      const id =
        youtubeMatch && youtubeMatch[2].length === 11 ? youtubeMatch[2] : null

      if (id != null) {
        return {
          id,
          url,
          type,
        }
      }
    } else if (type === 'normal-video') {
      const normalVideoMatch = normalVideoRegex.exec(url)

      const id = normalVideoMatch ? normalVideoMatch[0] : null

      if (id != null && url != null && type !== null) {
        return {
          id,
          url,
          type,
        }
      }
    } else {
      return {
        id: null,
        url: null,
        type: 'No specified video type',
      }
    }

    return null
  },
}
export const EmbedConfigs = [YoutubeEmbedConfig]

function AutoEmbedMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}) {
  let className = 'item'
  if (isSelected) {
    className += ' selected'
  }
  return (
    <li
      key={option.key}
      tabIndex={-1}
      className={className}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={'typeahead-item-' + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      <span className="text">{option.title}</span>
    </li>
  )
}

function AutoEmbedMenu({
  options,
  selectedItemIndex,
  onOptionClick,
  onOptionMouseEnter,
}) {
  return (
    <div className="typeahead-popover">
      <ul>
        {options.map((option, i) => (
          <AutoEmbedMenuItem
            index={i}
            isSelected={selectedItemIndex === i}
            onClick={() => onOptionClick(option, i)}
            onMouseEnter={() => onOptionMouseEnter(i)}
            key={option.key}
            option={option}
          />
        ))}
      </ul>
    </div>
  )
}

const debounce = (callback, delay) => {
  let timeoutId
  return (text) => {
    window.clearTimeout(timeoutId)
    timeoutId = window.setTimeout(() => {
      callback(text)
    }, delay)
  }
}

export function InsertVideoUriDialogBody({
  activeEditor,
  embedConfig,
  onClose,
}) {
  const [text, setText] = useState('')
  const [embedResult, setEmbedResult] = useState(null)
  const validateText = useMemo(
    () =>
      debounce((inputText) => {
        const urlMatch = URL_MATCHER.exec(inputText)
        if (embedConfig != null && inputText != null && urlMatch != null) {
          Promise.resolve(embedConfig.parseUrl(inputText)).then(
            (parseResult) => {
              setEmbedResult(parseResult)
            }
          )
        } else if (embedResult != null) {
          setEmbedResult(null)
        }
      }, 200),
    [embedConfig, embedResult]
  )

  const onClick = () => {
    if (embedResult != null) {
      embedConfig.insertNode(activeEditor, embedResult)
      onClose()
    }
  }
  return (
    <div style={{ width: '600px' }}>
      <div className="Input__wrapper">
        <input
          type="text"
          className="Input__input"
          placeholder={embedConfig.exampleUrl}
          value={text}
          data-test-id={`${embedConfig.type}-embed-modal-url`}
          onChange={(e) => {
            const { value } = e.target
            setText(value)
            validateText(value)
          }}
        />
      </div>
      <DialogActions>
        <Button
          disabled={!embedResult}
          onClick={onClick}
          data-test-id={`${embedConfig.type}-embed-modal-submit-btn`}
        >
          Confirm
        </Button>
      </DialogActions>
    </div>
  )
}

export function InsertVideoUploadedDialogBody({
  activeEditor,
  onClose,
  embedConfig,
}) {
  const [fileList, setFileList] = useState([])
  const [messageApi, contextHolder] = message.useMessage()

  const onClick = () => {
    if (fileList?.length) {
      fileList.forEach((eachVideoFile) => {
        if (eachVideoFile?.type === 'youtube-video') {
          activeEditor.dispatchCommand(
            INSERT_YOUTUBE_COMMAND,
            eachVideoFile?.url
          )
        } else if (eachVideoFile?.type === 'normal-video') {
          activeEditor.dispatchCommand(INSERT_VIDEO_COMMAND, eachVideoFile?.url)
        } else {
          return null
        }
      })
      onClose()
    }
  }

  const dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess('ok')
    }, 0)
  }

  const progress = {
    strokeColor: {
      '0%': '#108ee9',
      '100%': '#87d068',
    },
    strokeWidth: 3,
    format: (percent) => percent && `${parseFloat(percent.toFixed(2))}%`,
  }

  const loadVideo = async (File) => {
    try {
      if (!File?.type?.includes('image')) {
        message.loading(`Please wait to upload the ${File?.name} video...`, 0)
        getBase64(File).then(async (result) => {
          File['base64'] = await PresignedUrl({
            name: [File?.name],
            file: result,
            type: File?.type,
          })
          const urlMatch = URL_MATCHER.exec(File?.base64)

          if (urlMatch != null) {
            const parseResult = await embedConfig.parseUrl(File?.base64)
            setFileList((prev) => {
              const oldData = Array.isArray(prev) ? [...prev] : []
              oldData.push({
                name: File?.name ?? '',
                url: File?.base64,
                status: 'done',
                uid: File?.uid ?? '',
                type: parseResult?.type,
              })
              message.destroy()
              return oldData
            })
          }
        })
      }
    } catch (error) {
      message.destroy()
      console.error(error)
    }
  }

  const handleFileUploadonChange = (info) => {
    if (info?.file?.status !== 'uploading') {
      setFileList(info?.fileList)
    }
    if (info?.file?.status === 'done') {
      message.success(`${info?.file?.name} video uploaded successfully`)
    } else if (info?.file?.status === 'error') {
      message.error(`${info?.file?.name} video upload failed.`)
    } else if (info?.file?.status === 'removed') {
      message.info(`${info?.file?.name} video removed successfully`)
      setFileList(info?.fileList)
    }
  }

  return (
    <>
      {' '}
      <div className="lexical-video-dialog">
        {contextHolder}
        <Upload
          name="file"
          action={(e) => {
            loadVideo(e)
          }}
          // beforeUpload={() => {
          //   message.loading("Please wait to upload the video...", 0);
          // }}
          fileList={fileList}
          customRequest={dummyRequest}
          onChange={handleFileUploadonChange}
          accept="video/*"
          multiple={true}
          listType="picture"
          progress={progress}
        >
          <Button className="video-uploadButton">
            <UploadOutlined style={{ marginRight: '5px' }} /> Upload
          </Button>
        </Upload>
      </div>
      <p style={{ marginTop: '20px', fontSize: '14px' }}>
        <img
          src="https://img.freepik.com/free-vector/warning-sign-gradient-shine_78370-1774.jpg?t=st=1723626864~exp=1723630464~hmac=0d379fc45e3f9fc86f18052e2e9923e53fc38cfd82feab530fcdbf1a22dc457d&w=740"
          alt="warn"
          style={{ width: '20px', height: '20px' }}
        />
        <span> Accepted Video Formats will be mp4, webM, Ogg</span>
      </p>
      <DialogActions>
        <Button
          data-test-id="image-modal-file-upload-btn"
          onClick={() => onClick()}
          disabled={!fileList?.length}
        >
          Confirm
        </Button>
      </DialogActions>
    </>
  )
}

export function InsertVideoDialog({ activeEditor, embedConfig, onClose }) {
  const [mode, setMode] = useState('')
  const hasModifier = React.useRef(false)

  React.useEffect(() => {
    hasModifier.current = false
    const handler = (e) => {
      hasModifier.current = e.altKey
    }
    document.addEventListener('keydown', handler)
    return () => {
      document.removeEventListener('keydown', handler)
    }
  }, [activeEditor])

  return (
    <>
      {!mode && (
        <DialogButtonsList>
          <Button
            data-test-id="image-modal-option-url"
            onClick={() => setMode('url')}
          >
            URL
          </Button>
          <Button
            data-test-id="image-modal-option-file"
            onClick={() => setMode('file')}
          >
            File
          </Button>
        </DialogButtonsList>
      )}
      {mode === 'url' && (
        <InsertVideoUriDialogBody
          activeEditor={activeEditor}
          embedConfig={embedConfig}
          onClose={onClose}
        />
      )}
      {mode === 'file' && (
        <InsertVideoUploadedDialogBody
          onClose={onClose}
          embedConfig={embedConfig}
          activeEditor={activeEditor}
        />
      )}
    </>
  )
}

export function AutoEmbedDialog({ embedConfig, onClose }) {
  const [text, setText] = useState('')
  const [editor] = useLexicalComposerContext()
  const [embedResult, setEmbedResult] = useState(null)

  const validateText = useMemo(
    () =>
      debounce((inputText) => {
        const urlMatch = URL_MATCHER.exec(inputText)
        if (embedConfig != null && inputText != null && urlMatch != null) {
          Promise.resolve(embedConfig.parseUrl(inputText)).then(
            (parseResult) => {
              setEmbedResult(parseResult)
            }
          )
        } else if (embedResult != null) {
          setEmbedResult(null)
        }
      }, 200),
    [embedConfig, embedResult]
  )

  const onClick = () => {
    if (embedResult != null) {
      embedConfig.insertNode(editor, embedResult)
      onClose()
    }
  }

  return (
    <>
      {embedConfig?.contentName === 'Video' ? (
        <InsertVideoDialog
          activeEditor={editor}
          embedConfig={embedConfig}
          onClose={onClose}
        />
      ) : (
        <div style={{ width: '600px' }}>
          <div className="Input__wrapper">
            <input
              type="text"
              className="Input__input"
              placeholder={embedConfig.exampleUrl}
              value={text}
              data-test-id={`${embedConfig.type}-embed-modal-url`}
              onChange={(e) => {
                const { value } = e.target
                setText(value)
                validateText(value)
              }}
            />
          </div>
          <DialogActions>
            <Button
              disabled={!embedResult}
              onClick={onClick}
              data-test-id={`${embedConfig.type}-embed-modal-submit-btn`}
            >
              Confirm
            </Button>
          </DialogActions>
        </div>
      )}
    </>
  )
}

export default function AutoEmbedPlugin() {
  const [modal, showModal] = useModal()

  const openEmbedModal = (embedConfig) => {
    showModal(`${embedConfig.contentName}`, (onClose) => (
      <AutoEmbedDialog embedConfig={embedConfig} onClose={onClose} />
    ))
  }

  const getMenuOptions = (activeEmbedConfig, embedFn, dismissFn) => {
    return [
      new AutoEmbedOption('Dismiss', {
        onSelect: dismissFn,
      }),
      new AutoEmbedOption(`Embed ${activeEmbedConfig.contentName}`, {
        onSelect: embedFn,
      }),
    ]
  }

  return (
    <>
      {modal}
      <LexicalAutoEmbedPlugin
        embedConfigs={EmbedConfigs}
        onOpenEmbedModalForConfig={openEmbedModal}
        getMenuOptions={getMenuOptions}
        menuRenderFn={(
          anchorElementRef,
          {
            selectedIndex,
            options,
            selectOptionAndCleanUp,
            setHighlightedIndex,
          }
        ) =>
          anchorElementRef.current
            ? ReactDOM.createPortal(
                <div
                  className="typeahead-popover auto-embed-menu"
                  style={{
                    marginLeft: `${Math.max(
                      parseFloat(anchorElementRef.current.style.width) - 200,
                      0
                    )}px`,
                    width: 200,
                  }}
                >
                  <AutoEmbedMenu
                    options={options}
                    selectedItemIndex={selectedIndex}
                    onOptionClick={(option, index) => {
                      setHighlightedIndex(index)
                      selectOptionAndCleanUp(option)
                    }}
                    onOptionMouseEnter={(index) => {
                      setHighlightedIndex(index)
                    }}
                  />
                </div>,
                anchorElementRef.current
              )
            : null
        }
      />
    </>
  )
}
