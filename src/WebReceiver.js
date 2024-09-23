import React, { useState, useEffect } from 'react'

const WebViewReceiver = ({ setHtml }) => {
  useEffect(() => {
    const handleMessage = (event) => {
      // Ensure the message is from the expected source (e.g., add security checks)
      if (event.data) {
        try {
          const data = JSON.parse(event.data)
          console.log('Received message from RN:', data)
          if (typeof data.value.value === 'string') {
            setHtml(data.value.value) // Set the message in state (you can adjust what you display)
          }
        } catch (error) {
          console.error('error')
        }
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  return (
    <div>
      <h1>Message from React Native:</h1>
      <div>{message ? message : 'No message received yet'}</div>
    </div>
  )
}

export default WebViewReceiver
