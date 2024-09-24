import React, { useEffect, useState } from 'react'
import LexicalEditor from './LexicalEditor/App'
import WebViewComponent from './WebReceiver'

const App = () => {
  const [message, setMessage] = useState('')
  const sendMessageToReactNative = () => {
    try {
      const data = { message: message }
      window.ReactNativeWebView.postMessage(JSON.stringify(data))
    } catch (error) {
      console.error(error.message)
    }
  }
  const sendMessageToReactNativeValue = (value) => {
    try {
      const data = { message: value }
      window.ReactNativeWebView.postMessage(JSON.stringify(data))
    } catch (error) {
      console.error(error.message)
    }
  }

  // useEffect(() => {
  //   sendMessageToReactNative()
  // }, [message])
  return (
    <div>
      <LexicalEditor
        value={message}
        onChange={(event) => {
          // setMessage(event)
          if (event !== `<p class="aroopa_editor__paragraph"><br></p>`) {
            sendMessageToReactNativeValue(event)
          }
        }}
      />
      <WebViewComponent setHtml={setMessage} html={message} />
    </div>
  )
}

export default App
