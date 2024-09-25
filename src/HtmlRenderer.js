import React, { useEffect, useState } from 'react'
import './LexicalEditor/index.css'

const HtmlRenderer = () => {
  const [html, setHtml] = useState('')
  useEffect(() => {
    const handleMessage = (event) => {
      if (event?.data) {
        try {
          const data = JSON.parse(event.data)
          if (data?.key) {
            setHtml(data.key)
          } else {
            console.warn('Received message does not contain expected value')
          }
          setMessage(event.data)
        } catch (error) {
          console.error('Error parsing message from RN:', error)
        }
      }
    }
    document.addEventListener('message', handleMessage)
    window.addEventListener('message', handleMessage)
    return () => {
      document.removeEventListener('message', handleMessage)
      window.removeEventListener('message', handleMessage)
    }
  }, [])
  return (
    <div className="editor-shell" dangerouslySetInnerHTML={{ __html: html }} />
  )
}

export default HtmlRenderer
