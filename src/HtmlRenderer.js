import React, { useEffect, useState } from 'react'
import './LexicalEditor/index.css'

const HtmlRenderer = () => {
  const [html, setHtml] = useState('') // State to hold HTML content

  useEffect(() => {
    const handleMessage = (event) => {
      if (event?.data) {
        try {
          const data = JSON.parse(event.data) // Parse the message received from React Native
          if (data?.key) {
            setHtml(data.key) // Update the HTML content in state
          } else {
            console.warn('Received message does not contain expected value')
          }
        } catch (error) {
          console.error('Error parsing message from React Native:', error)
        }
      }
    }

    // Add event listeners to receive messages from React Native
    document.addEventListener('message', handleMessage)
    window.addEventListener('message', handleMessage)

    return () => {
      // Clean up the event listeners
      document.removeEventListener('message', handleMessage)
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  return (
    <div className="editor-shell" dangerouslySetInnerHTML={{ __html: html }} />
  )
}

export default HtmlRenderer
