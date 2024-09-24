/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $wrapNodeInElement, mergeRegister } from '@lexical/utils'
import {
  $createParagraphNode,
  $createRangeSelection,
  $getSelection,
  $insertNodes,
  $isNodeSelection,
  $isRootOrShadowRoot,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
  LexicalCommand,
  LexicalEditor,
} from 'lexical'
import { useEffect, useRef, useState } from 'react'
import * as React from 'react'
import { CAN_USE_DOM } from '../../shared/canUseDOM.ts'
import { message } from 'antd'

import {
  $createImageNode,
  $isImageNode,
  ImageNode,
  ImagePayload,
} from '../../nodes/ImageNode.tsx'
import Button from '../../ui/Button.tsx'
import { DialogActions, DialogButtonsList } from '../../ui/Dialog.tsx'
import TextInput from '../../ui/TextInput.tsx'
import ImageCompress from '../../../MessageBoard/ImageCompress.jsx'
import PresignedUrl from '../../../MessageBoard/PresignedUrl.jsx'
import { Image, Upload } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

export type InsertImagePayload = Readonly<ImagePayload>

const getDOMSelection = (targetWindow: Window | null): Selection | null =>
  CAN_USE_DOM ? (targetWindow || window).getSelection() : null

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
  createCommand('INSERT_IMAGE_COMMAND')

export function InsertImageUriDialogBody({
  onClick,
}: {
  onClick: (payload: InsertImagePayload) => void
}) {
  const [src, setSrc] = useState('')
  const [altText, setAltText] = useState('')

  const isDisabled = src === ''

  return (
    <>
      <TextInput
        label="Image URL"
        placeholder="i.e. https://source.unsplash.com/random"
        onChange={setSrc}
        value={src}
        data-test-id="image-modal-url-input"
      />
      <TextInput
        label="Alt Text"
        placeholder="Random unsplash image"
        onChange={setAltText}
        value={altText}
        data-test-id="image-modal-alt-text-input"
      />
      <DialogActions>
        <Button
          data-test-id="image-modal-confirm-btn"
          disabled={isDisabled}
          onClick={() =>
            onClick({
              altText,
              src,
              srcArray: [],
            })
          }
        >
          Confirm
        </Button>
      </DialogActions>
    </>
  )
}

export function InsertImageUploadedDialogBody({
  onClick,
}: {
  onClick: (payload: InsertImagePayload) => void
}) {
  type ImageData = {
    imageUrl: any
  }
  const [srcArray, setSrcArray] = useState<ImageData[]>([])
  const altText = 'lexical_image_altText'

  type FileItem = {
    name: string
    url: string
    status: string
    uid: string
  }

  const [fileList, setFileList] = useState<FileItem[]>([])
  const isDisabled = srcArray?.length ? false : true
  const loadImage = async (file: File | any) => {
    try {
      const base64 = await ImageCompress({ base64String: file })
      const reader = new FileReader()
      interface Data {
        [key: string]: any // Use 'string', 'number', or any other type if more specific
      }
      const data: Data = {}
      const currentUnixTimestamp = Math.floor(Date.now() / 1000)
      data.blobNames = [`${currentUnixTimestamp}-${file?.name}`]
      data.containerName = 'documents'

      try {
        const presignedUrl = await PresignedUrl({
          name: data.blobNames,
          file: base64,
          type: file?.type,
          filePath: data.containerName,
        })

        if (presignedUrl) {
          setSrcArray((prev) => {
            const oldData = [...prev]
            oldData.push({
              imageUrl: presignedUrl,
            })
            return oldData
          })
        }

        setFileList((prev: FileItem[]) => {
          const oldData = Array.isArray(prev) ? [...prev] : []
          oldData.push({
            name: file?.name ?? '',
            url: presignedUrl,
            status: 'done',
            uid: file?.uid ?? '',
          })
          message.destroy()
          return oldData
        })
      } catch (error) {
        console.error(error)
        message.error(error?.message)
      }
      if (file !== null) {
        reader.readAsDataURL(file)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleFileUploadonChange = (info) => {
    if (info?.file?.status !== 'uploading') {
      setFileList(info?.fileList)
    }
    if (info?.file?.status === 'done') {
      message.success(`${info?.file?.name} file uploaded successfully`)
    } else if (info?.file?.status === 'error') {
      message.error(`${info?.file?.name} file upload failed.`)
    } else if (info?.file?.status === 'removed') {
      message.info(`${info?.file?.name} file removed successfully`)
      setSrc([])
      setFileList(info?.fileList)
    }
  }

  const dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess('ok')
    }, 0)
  }

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [messageApi, contextHolder] = message.useMessage()

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj)
    }
    setPreviewImage(file.url || file.preview)
    setPreviewOpen(true)
  }

  const uploadButton = (
    <button
      style={{
        border: 0,
        background: 'none',
      }}
      type="button"
    >
      <PlusOutlined />
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </button>
  )

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {' '}
        <Upload
          action={loadImage}
          fileList={fileList}
          beforeUpload={() => {
            message.loading('Please wait to upload the Image...', 0)
          }}
          listType="picture-card"
          customRequest={dummyRequest}
          onChange={handleFileUploadonChange}
          onPreview={handlePreview}
          accept="image/*"
          multiple
        >
          {uploadButton}
        </Upload>
      </div>
      <p style={{ marginTop: '20px', fontSize: '14px' }}>
        <img
          src="https://img.freepik.com/free-vector/warning-sign-gradient-shine_78370-1774.jpg?t=st=1723626864~exp=1723630464~hmac=0d379fc45e3f9fc86f18052e2e9923e53fc38cfd82feab530fcdbf1a22dc457d&w=740"
          alt="warn"
          style={{ width: '20px', height: '20px' }}
        />
        <span>
          {' '}
          Accepted Image Formats will be .jpg, .jpeg, .png, .gif, .bmp, .webp,
          .tiff, .svg, .ico
        </span>
      </p>
      {contextHolder}{' '}
      {previewImage && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(''),
          }}
          src={previewImage}
        />
      )}
      <DialogActions>
        <Button
          data-test-id="image-modal-file-upload-btn"
          disabled={isDisabled}
          onClick={() =>
            onClick({
              altText,
              srcArray,
              src: '',
            })
          }
        >
          Confirm
        </Button>
      </DialogActions>
    </>
  )
}

export function InsertImageDialog({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor
  onClose: () => void
}): JSX.Element {
  const [mode, setMode] = useState<null | 'url' | 'file'>(null)
  const hasModifier = useRef(false)

  useEffect(() => {
    hasModifier.current = false
    const handler = (e: KeyboardEvent) => {
      hasModifier.current = e.altKey
    }
    document.addEventListener('keydown', handler)
    return () => {
      document.removeEventListener('keydown', handler)
    }
  }, [activeEditor])

  const onClick = (payload: InsertImagePayload) => {
    activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload)
    onClose()
  }

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
      {mode === 'url' && <InsertImageUriDialogBody onClick={onClick} />}
      {mode === 'file' && <InsertImageUploadedDialogBody onClick={onClick} />}
    </>
  )
}

export default function ImagesPlugin({
  captionsEnabled,
}: {
  captionsEnabled?: boolean
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error('ImagesPlugin: ImageNode not registered on editor')
    }

    return mergeRegister(
      editor.registerCommand<InsertImagePayload>(
        INSERT_IMAGE_COMMAND,
        (payload) => {
          const { altText, srcArray, src } = payload
          if (srcArray?.length || srcArray === null || srcArray === undefined) {
            srcArray?.forEach((eachSrc) => {
              const imageNode = $createImageNode({
                src: eachSrc?.imageUrl,
                altText: altText,
                srcArray: [],
                showCaption: false,
              })
              $insertNodes([imageNode])
              if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
                $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd()
              }
            })
          } else {
            const imageNode = $createImageNode({
              src: src,
              altText: altText,
              srcArray: [],
              showCaption: false,
            })
            $insertNodes([imageNode])
            if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
              $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd()
            }
          }
          return true
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerCommand<DragEvent>(
        DRAGSTART_COMMAND,
        (event) => {
          return $onDragStart(event)
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand<DragEvent>(
        DRAGOVER_COMMAND,
        (event) => {
          return $onDragover(event)
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<DragEvent>(
        DROP_COMMAND,
        (event) => {
          return $onDrop(event, editor)
        },
        COMMAND_PRIORITY_HIGH
      )
    )
  }, [captionsEnabled, editor])

  return null
}

const TRANSPARENT_IMAGE =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
const img = document.createElement('img')
img.src = TRANSPARENT_IMAGE

function $onDragStart(event: DragEvent): boolean {
  const node = $getImageNodeInSelection()
  if (!node) {
    return false
  }
  const dataTransfer = event.dataTransfer
  if (!dataTransfer) {
    return false
  }
  dataTransfer.setData('text/plain', '_')
  dataTransfer.setDragImage(img, 0, 0)
  dataTransfer.setData(
    'application/x-lexical-drag',
    JSON.stringify({
      data: {
        altText: node.__altText,
        caption: node.__caption,
        height: node.__height,
        key: node.getKey(),
        maxWidth: node.__maxWidth,
        showCaption: node.__showCaption,
        src: node.__src,
        width: node.__width,
      },
      type: 'image',
    })
  )

  return true
}

function $onDragover(event: DragEvent): boolean {
  const node = $getImageNodeInSelection()
  if (!node) {
    return false
  }
  if (!canDropImage(event)) {
    event.preventDefault()
  }
  return true
}

function $onDrop(event: DragEvent, editor: LexicalEditor): boolean {
  const node = $getImageNodeInSelection()
  if (!node) {
    return false
  }
  const data = getDragImageData(event)
  if (!data) {
    return false
  }
  event.preventDefault()
  if (canDropImage(event)) {
    const range = getDragSelection(event)
    node.remove()
    const rangeSelection = $createRangeSelection()
    if (range !== null && range !== undefined) {
      rangeSelection.applyDOMRange(range)
    }
    $setSelection(rangeSelection)
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, data)
  }
  return true
}

function $getImageNodeInSelection(): ImageNode | null {
  const selection = $getSelection()
  if (!$isNodeSelection(selection)) {
    return null
  }
  const nodes = selection.getNodes()
  const node = nodes[0]
  return $isImageNode(node) ? node : null
}

function getDragImageData(event: DragEvent): null | InsertImagePayload {
  const dragData = event.dataTransfer?.getData('application/x-lexical-drag')
  if (!dragData) {
    return null
  }
  const { type, data } = JSON.parse(dragData)
  if (type !== 'image') {
    return null
  }

  return data
}

declare global {
  interface DragEvent {
    rangeOffset?: number
    rangeParent?: Node
  }
}

function canDropImage(event: DragEvent): boolean {
  const target = event.target
  return !!(
    target &&
    target instanceof HTMLElement &&
    !target.closest('code, span.editor-image') &&
    target.parentElement &&
    target.parentElement.closest('div.ContentEditable__root')
  )
}

function getDragSelection(event: DragEvent): Range | null | undefined {
  let range
  const target = event.target as null | Element | Document
  const targetWindow =
    target == null
      ? null
      : target.nodeType === 9
        ? (target as Document).defaultView
        : (target as Element).ownerDocument.defaultView
  const domSelection = getDOMSelection(targetWindow)
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(event.clientX, event.clientY)
  } else if (event.rangeParent && domSelection !== null) {
    domSelection.collapse(event.rangeParent, event.rangeOffset || 0)
    range = domSelection.getRangeAt(0)
  } else {
    throw Error(`Cannot get the selection when dragging`)
  }

  return range
}
function setSrc(arg0: never[]) {
  throw new Error('Function not implemented.')
}
