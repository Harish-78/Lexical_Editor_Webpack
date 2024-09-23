import React, { useState, useEffect } from 'react'

const WebViewReceiver = ({ setHtml }) => {
  const [message, setMessage] = useState('')
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data) {
        try {
          const data = JSON.parse(event.data)
          console.log('Received message from RN:', data)
          setHtml(data.value.value)
          setMessage(JSON.stringify(event.data))
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

  return <div>harish {message}</div>
}

export default WebViewReceiver
