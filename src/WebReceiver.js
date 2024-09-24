import { useState, useEffect } from 'react'

const WebViewComponent = () => {
  const [message, setMessage] = useState('')
  const [html, setHtml] = useState('')

  useEffect(() => {
    const handleMessage = (event) => {
      if (event?.data) {
        try {
          // Parse the incoming data
          const data = JSON.parse(event.data)

          console.log('Received message from RN:', data)

          // Assuming data.value.value is where the HTML content is
          if (data?.value?.value) {
            setHtml(data.value.value)
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

    // Add event listener for messages from React Native
    window.addEventListener('message', handleMessage)

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  return (
    <div>
      <h1>WebView Content</h1>
      {/* Render the HTML content from React Native */}
      <div dangerouslySetInnerHTML={{ __html: html }}></div>
      {/* Display the received message for debugging */}
      <pre>{message}</pre>
    </div>
  )
}

export default WebViewComponent
