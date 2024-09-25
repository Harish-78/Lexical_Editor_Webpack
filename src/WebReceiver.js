import { useState, useEffect } from 'react'

const WebViewComponent = ({ setHtml, html }) => {
  useEffect(() => {
    const handleMessage = (event) => {

      if (event?.data) {
        try {
          // Parse the incoming data
          const data = JSON.parse(event.data)

          // alert(`Received message from RN: ${data.key} `)

          // Assuming data.value.value is where the HTML content is
          if (data?.key) {
            setHtml(data.key)
          } else {
            console.warn('Received message does not contain expected value')
          }

          // Set the message state to the parsed object for debugging or display
          setMessage(event.data) // `event.data` is already stringified
        } catch (error) {
          console.error('Error parsing message from RN:', error)
        }
      }
    }

    document.addEventListener('message', handleMessage)
    window.addEventListener('message', handleMessage)

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener('message', handleMessage)
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  return (
    <div>
      <h1>WebView Content</h1>
      {/* Render the HTML content from React Native */}
      <div dangerouslySetInnerHTML={{ __html: html }}></div>
      {/* Display the received message for debugging */}
    </div>
  )
}

export default WebViewComponent
