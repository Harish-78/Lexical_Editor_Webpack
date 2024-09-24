import React, { useEffect, useState } from 'react'
import LexicalEditor from './LexicalEditor/App'
import WebViewReceiver from './WebReceiver'

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

  useEffect(() => {
    sendMessageToReactNative()
  }, [message])
  return (
    <div>
      <LexicalEditor
        value={message}
        onChange={(event) => {
          setMessage(event)
        }}
      />
      <WebViewReceiver setHtml={setMessage} />
    </div>
  )
}

export default App
