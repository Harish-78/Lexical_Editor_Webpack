import React from 'react'
import { createRoot } from 'react-dom/client'
import RichTextEditor from './RichTextEditor'
import HtmlRenderer from './HtmlRenderer'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RichTextEditor />,
  },
  {
    path: 'htmlrenderer',
    element: <HtmlRenderer />,
  },
])

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
