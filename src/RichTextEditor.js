import React, { useEffect, useState } from 'react'
import LexicalEditor from './LexicalEditor/App'
import WebViewComponent from './WebReceiver'

const RichTextEditor = () => {
  const [message, setMessage] = useState('')

  const sendMessageToReactNativeValue = (value) => {
    try {
      const data = { message: value }
      window.ReactNativeWebView.postMessage(JSON.stringify(data))
    } catch (error) {
      console.error(error.message)
    }
  }

  return (
    <div>
      <LexicalEditor
        value={message}
        onChange={(event) => {
          if (event !== `<p class="aroopa_editor__paragraph"><br></p>`) {
            sendMessageToReactNativeValue(event)
          }
        }}
      />
      <WebViewComponent setHtml={setMessage} html={message} />
    </div>
  )
}

export default RichTextEditor
