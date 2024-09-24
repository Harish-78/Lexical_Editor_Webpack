import { useEffect, useState } from 'react'
import { DialogActions, DialogButtonsList } from '../../ui/Dialog.tsx'
import TextInput from '../../ui/TextInput.tsx'
import { COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import mergeRegister from '../lexicalUtils/mergeRegister.ts'
import { message, Switch } from 'antd'
import PresignedUrl from '../../../MessageBoard/PresignedUrl.jsx'
import { UploadOutlined } from '@ant-design/icons'
import { Upload } from 'antd'
import Button from '../../ui/Button.tsx'

export const INSERT_DOCUMENT_COMMAND = createCommand('INSERT_DOCUMENT_COMMAND')

export const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.onerror = (error) => reject(null)
  })
}

export function InsertDocumentUriDialogBody({ onClick }) {
  const [url, setUrl] = useState({
    document_name: '',
    document_url: '',
    type: '',
  })
  const [src, setSrc] = useState([])
  const [visibleLoading, setVisibleLoading] = useState(null)
  const [disabled, setDisabled] = useState(true)
  const handleChange = async (value) => {
    try {
      setVisibleLoading(true)
      const documentName = value?.trim()?.split('/')?.reverse()
      const documentType = documentName?.length
        ? documentName[0]?.trim()?.split('.')?.reverse()
        : ''
      setUrl({
        document_name: documentName?.length ? documentName[0] : '',
        document_url: value,
        type: documentType?.length ? documentType[0] : '',
      })
      setVisibleLoading(false)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    setSrc([url])
  }, [url])

  useEffect(() => {
    if (src?.length > 0) {
      setDisabled(false)
    }
  }, [src])

  return (
    <>
      <TextInput
        label="Doc URL"
        placeholder="Type URL here.."
        onChange={handleChange}
        value={url?.document_url}
        data-test-id="document-modal-url-input"
      />

      <DialogActions>
        <Button
          loading={visibleLoading}
          data-test-id="document-modal-confirm-btn"
          disabled={disabled}
          onClick={() => onClick({ src })}
        >
          Confirm
        </Button>
      </DialogActions>
    </>
  )
}

export function InsertDocumentUploadedDialogBody({ onClick }) {
  const [src, setSrc] = useState([])
  const [multiple, setMultiple] = useState(false)
  const [visibleLoading, setVisibleLoading] = useState(null)
  const [disabled, setDisabled] = useState(true)
  const [messageApi, contextHolder] = message.useMessage()

  const onChange = (checked) => {
    setMultiple(checked)
  }

  useEffect(() => {
    if (src?.length > 0) {
    }
    setDisabled(false)
  }, [src])

  const handleFileInputChange = (file) => {
    try {
      setVisibleLoading(true)
      getBase64(file).then(async (result) => {
        file['base64'] = await PresignedUrl({
          name: [file?.name],
          file: result,
          type: file?.type,
        })
        setSrc((prev) => {
          const oldData = Array.isArray(prev) ? [...prev] : []
          oldData.push({
            name: file?.name,
            url: file?.base64,
            type: file?.type,
            status: 'done',
            uid: Number(src?.length) + 1,
          })
          message.destroy()
          messageApi.success('File successfully uploaded', 2.5)
          return oldData
        })
      })
      setVisibleLoading(false)
    } catch (error) {
      console.error(error)
      messageApi.error('File processing or API call failed')
    }
  }

  const handleFileUploadonChange = (info) => {
    setVisibleLoading(true)

    if (info?.file?.status !== 'uploading') {
      setSrc(info.fileList)
    }
    if (info?.file?.status === 'done') {
      message.success(`${info?.file?.name} file uploaded successfully`)
    } else if (info?.file?.status === 'error') {
      message.error(`${info?.file?.name} file upload failed.`)
    }
    setVisibleLoading(false)
  }

  const progress = {
    strokeColor: {
      '0%': '#108ee9',
      '100%': '#87d068',
    },
    strokeWidth: 3,
    format: (percent) => percent && `${parseFloat(percent.toFixed(2))}%`,
  }

  const dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess('ok')
    }, 0)
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'end',
          marginBottom: '10px',
          alignItems: 'center',
        }}
      >
        {contextHolder}{' '}
        <Switch size="small" defaultChecked={false} onChange={onChange} />{' '}
        <p style={{ marginLeft: '5px', fontSize: '15px' }}>
          {multiple ? 'Multiple' : 'Single'}
        </p>
      </div>
      <p style={{ fontSize: '17px', marginBottom: '10px' }}>Document Upload</p>{' '}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {' '}
        <Upload
          name="file"
          action={(e) => {
            handleFileInputChange(e)
          }}
          beforeUpload={() => {
            message.loading('Please wait to attach the file...', 0)
          }}
          customRequest={dummyRequest}
          accept="*"
          onChange={handleFileUploadonChange}
          multiple={multiple}
          progress={progress}
          fileList={src}
        >
          <Button icon={<UploadOutlined />}>Upload</Button>{' '}
        </Upload>
      </div>
      <DialogActions>
        <Button
          data-test-id="document-modal-file-upload-btn"
          disabled={disabled}
          onClick={() =>
            onClick({
              src: src?.length
                ? src?.map((file) => ({
                    document_name: file?.name,
                    document_url: file?.url,
                    type: file?.type,
                  }))
                : [],
            })
          }
          type="primary"
        >
          Confirm
        </Button>
      </DialogActions>
    </>
  )
}

export function InsertDocumentDialog({ activeEditor, onClose }) {
  const [mode, setMode] = useState('')
  const onClick = (payload) => {
    try {
      activeEditor.dispatchCommand(INSERT_DOCUMENT_COMMAND, payload)
      message.success('Attachment uploaded successfully')
      onClose()
    } catch (error) {
      message.error('Failed to Upload Document')
      console.error(error)
    }
  }
  return (
    <>
      {!mode && (
        <DialogButtonsList>
          <Button
            data-test-id="document-modal-option-url"
            onClick={() => setMode('url')}
          >
            URL
          </Button>
          <Button
            data-test-id="document-modal-option-file"
            onClick={() => setMode('file')}
          >
            File
          </Button>
        </DialogButtonsList>
      )}
      {mode === 'url' && <InsertDocumentUriDialogBody onClick={onClick} />}
      {mode === 'file' && (
        <InsertDocumentUploadedDialogBody onClick={onClick} />
      )}
    </>
  )
}

export default function DocumentsPlugin({ setFilesHandle, onDocumentUpdate }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        INSERT_DOCUMENT_COMMAND,
        (payload) => {
          const { src } = payload || []
          setFilesHandle((prev) => {
            const data = [...(prev || []), ...(src || [])]
            onDocumentUpdate &&
              onDocumentUpdate({
                createdDocuments: data,
              })
            return data
          })
          return true
        },
        COMMAND_PRIORITY_EDITOR
      )
    )
  }, [editor])

  return null
}
