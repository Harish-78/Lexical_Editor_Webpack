import React, { useEffect, useState } from 'react'
import './styles.css'
import Editor from './Editor'
import WebViewReceiver from './WebReceiver'

const App = () => {
  const [html, setHtml] = useState('')

  const sendMessageToReactNative = () => {
    try {
      const data = { message: html }
      window.ReactNativeWebView.postMessage(JSON.stringify(data))
    } catch (error) {
      console.error(error.message)
    }
  }
  useEffect(() => {
    sendMessageToReactNative()
  }, [html])

  return (
    <div>
      <h1>Hello, React with Webpack!</h1>
      <WebViewReceiver setHtml={setHtml} />
      <Editor
        value={html}
        onChange={(event) => {
          setHtml(event)
        }}
      />
    </div>
  )
}

export default App
