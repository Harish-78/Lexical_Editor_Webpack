import React, { useState } from 'react'
import './styles.css'
import Editor from './Editor'

const App = () => {
  const [html, setHtml] = useState('')
  return (
    <div>
      <h1>Hello, React with Webpack!</h1>
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
