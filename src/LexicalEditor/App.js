import { LexicalComposer } from '@lexical/react/LexicalComposer'
import React, { useEffect, useState } from 'react'
import { FlashMessageContext } from './context/FlashMessageContext.tsx'
import { SettingsContext } from './context/SettingsContext.tsx'
import { SharedAutocompleteContext } from './context/SharedAutocompleteContext.tsx'
import { SharedHistoryContext } from './context/SharedHistoryContext.tsx'
import Editor from './Editor'
import PlaygroundNodes from './nodes/PlaygroundNodes.ts'
import { TableContext } from './plugins/TablePlugin.tsx'
import PlaygroundEditorTheme from './themes/PlaygroundEditorTheme.ts'
import './index.css'
import './themes/PlaygroundEditorTheme.css'
import { Chip } from '@mui/material'
import { message } from 'antd'
import PresignedUrl from '../MessageBoard/PresignedUrl.jsx'
import { getBase64 } from './plugins/Document/DocumentPlugin.js'
import LandingPageEditorTheme from './themes/LandingPageEditorTheme.ts'
import componentsEnum from '../enum/components.js'

function LexicalEditor({
  value,
  onChange,
  mentionList,
  entity_type,
  entity_id,
  editorDocuments,
  onDocumentUpdate,
  defaultStyles,
  variables,
  componentName,
  onEmailThreadChange,
  emailReplyThread,
  everyOne,
  isExternal,
  placeholder,
}) {
  const isLandingPageTheme = componentName === componentsEnum?.LandingPages

  const initialConfig = {
    namespace: 'Playground',
    nodes: [...PlaygroundNodes],
    onError: (error) => {
      throw error
    },
    theme: isLandingPageTheme ? LandingPageEditorTheme : PlaygroundEditorTheme,
  }

  const [filesHandle, setFilesHandle] = React.useState(
    editorDocuments?.createdDocument
  )

  const [handleDocuments, setHandleDocuments] = React.useState(
    editorDocuments?.documents
  )

  const [deletedDocumentId, setDeletedDocumentId] = useState([])

  const handleDrop = (e) => {
    e.preventDefault()
    try {
      const droppedFile = e.dataTransfer.files[0]
      if (!droppedFile?.type?.includes('image')) {
        getBase64(droppedFile).then(async (result) => {
          droppedFile['base64'] = await PresignedUrl({
            name: [droppedFile?.name],
            file: result,
            type: droppedFile?.type,
          })
          setFilesHandle((prev) => {
            const oldData = Array.isArray(prev) ? [...prev] : []
            oldData.push({
              document_name: droppedFile?.name,
              document_url: droppedFile?.base64,
              type: droppedFile?.type,
            })
            onDocumentUpdate &&
              onDocumentUpdate?.({
                createdDocuments: oldData,
                documents: handleDocuments,
                deletedDocumentIds: deletedDocumentId,
              })
            return oldData
          })
          message.success(`File uploaded successfully`)
        })
      }
    } catch (error) {
      console.error(error)
      message.error(`Unable to  uploaded File , Please try Again`)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const fileRemove = (index, deletedDocumentId) => {
    try {
      setFilesHandle((prev) => {
        const oldData = Array.isArray(prev) ? [...prev] : []
        oldData?.splice(index, 1)
        onDocumentUpdate &&
          onDocumentUpdate({
            createdDocument: oldData ?? [],
          })
        return oldData
      })

      if (deletedDocumentId) {
        setHandleDocuments((prev) => {
          const oldData = Array.isArray(prev) ? [...prev] : []
          oldData?.splice(index, 1)
          onDocumentUpdate &&
            onDocumentUpdate({
              documents: oldData ?? [],
            })
          return oldData
        })

        setDeletedDocumentId((prev) => {
          const oldData = Array.isArray(prev) ? [...prev] : []
          oldData?.push(deletedDocumentId)
          onDocumentUpdate &&
            onDocumentUpdate({
              deletedDocument: oldData ?? [],
            })
          return oldData
        })
      }

      message.warning('File removed Successfully')
    } catch (error) {
      console.error(error)
      message.error(`Unable to Delete File , Please try Again`)
    }
  }

  const checkDocumentPluginAllowed = ({ componentName }) => {
    try {
      switch (componentName) {
        case componentsEnum?.Wiki:
        case componentsEnum?.MessageBoard:
        case componentsEnum?.Projects:
        case componentsEnum?.Spaces:
          return true
        default:
          return false
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <SharedHistoryContext>
        <TableContext>
          <SharedAutocompleteContext>
            <div
              className="editor-shell"
              onDrop={
                checkDocumentPluginAllowed({ componentName })
                  ? handleDrop
                  : null
              }
              onDragOver={
                checkDocumentPluginAllowed({ componentName })
                  ? handleDragOver
                  : null
              }
            >
              <Editor
                value={value}
                mentionList={mentionList}
                entity_type={entity_type}
                componentName={componentName}
                entity_id={entity_id}
                setFilesHandle={setFilesHandle}
                onDocumentUpdate={onDocumentUpdate}
                onChange={onChange}
                defaultStyles={defaultStyles}
                variables={variables}
                emailReplyThread={emailReplyThread}
                onEmailThreadChange={onEmailThreadChange}
                everyOne={everyOne}
                isExternal={isExternal}
                placeholderText={placeholder}
              />
            </div>
            {handleDocuments?.length
              ? handleDocuments?.map((x, index) => {
                  return (
                    <Chip
                      key={index}
                      label={x?.document_name}
                      variant="outlined"
                      onDelete={() => fileRemove(index, x?._id)}
                    />
                  )
                })
              : ''}
            {filesHandle?.length
              ? filesHandle?.map((x, index) => {
                  return (
                    <Chip
                      key={index}
                      label={x?.document_name}
                      variant="outlined"
                      onDelete={() => fileRemove(index)}
                    />
                  )
                })
              : ''}
          </SharedAutocompleteContext>
        </TableContext>
      </SharedHistoryContext>
    </LexicalComposer>
  )
}

export default function App({
  mentionList,
  entity_type,
  entity_id,
  componentName,
  editorDocuments,
  onDocumentUpdate,
  defaultStyles,
  variables,
  emailReplyThread,
  onEmailThreadChange,
  everyOne,
  isExternal,
  placeholder,
}) {
  const [dataFromNative, setDataFromNative] = useState('')

  // Define the function that receives data from the React Native app
  window.receiveDataFromNative = (data) => {
    console.log('Received data from React Native:', data)
    setDataFromNative(data) // Store or display data
  }

  function sendDataToNativeApp(data) {
    if (
      window.ReactNativeWebView &&
      typeof window.ReactNativeWebView.postMessage === 'function'
    ) {
      window.ReactNativeWebView.postMessage(data) // Send data to React Native app
    } else {
      console.log('This is not running inside a WebView')
    }
  }

  useEffect(() => {
    // Example of sending some initial data to React Native when the component loads
    sendDataToNativeApp('Hello from the React app!')
  }, [])

  return (
    <SettingsContext>
      <FlashMessageContext>
        <LexicalEditor
          emailReplyThread={emailReplyThread}
          onEmailThreadChange={onEmailThreadChange}
          value={dataFromNative}
          onChange={(event) => {
            setDataFromNative(event)
          }}
          mentionList={mentionList}
          entity_type={entity_type}
          entity_id={entity_id}
          editorDocuments={editorDocuments}
          onDocumentUpdate={onDocumentUpdate}
          defaultStyles={defaultStyles}
          variables={variables}
          componentName={componentName}
          everyOne={everyOne}
          isExternal={isExternal}
          placeholder={placeholder}
        />
        <button
          onClick={() => sendDataToNativeApp(dataFromNative ?? 'New Value')}
        >
          Send to React Native
        </button>
      </FlashMessageContext>
    </SettingsContext>
  )
}
