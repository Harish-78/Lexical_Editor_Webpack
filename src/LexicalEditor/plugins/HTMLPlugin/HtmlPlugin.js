import { Input, message } from 'antd'
import React, { useEffect, useState } from 'react'
import {
  $insertNodes,
  $setSelection,
  CLEAR_EDITOR_COMMAND,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
} from 'lexical'
import { DialogActions } from '../../ui/Dialog.tsx'
import Button from '../../ui/Button.tsx'
import { mergeRegister } from '@lexical/utils'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $generateNodesFromDOM } from '@lexical/html'
import prettier from 'prettier/standalone'
import parserHtml from 'prettier/parser-html'
const { TextArea } = Input
export const INSERT_HTML_COMMAND = createCommand('INSERT_HTML_COMMAND')

export function InsertHTMLDialog({ activeEditor, onClose, htmlContent }) {
  const [editorData, setEditorData] = useState('')
  useEffect(() => {
    setTimeout(() => {
      setEditorData(updatedHtml(htmlContent))
    }, 0)
  }, [])

  const onClick = () => {
    try {
      activeEditor.dispatchCommand(INSERT_HTML_COMMAND, {
        htmlContent: editorData,
      })
      message.success('Content updated Successfully')
      onClose()
    } catch (error) {
      console.log(error)
    }
  }

  const handleTextAreaChange = (e) => {
    const newValue = e.target.value
    setEditorData(newValue)
  }

  const updatedHtml = (htmlString) => {
    try {
      const formattedHtml = prettier.format(htmlString, {
        parser: 'html',
        plugins: [parserHtml],
        htmlWhitespaceSensitivity: 'css',
      })
      return formattedHtml
    } catch (error) {
      console.error('Error formatting HTML:', error)
      message.error('Error on Formatting', 2.5)
      return htmlString
    }
  }

  return (
    <>
      <TextArea rows={15} value={editorData} onChange={handleTextAreaChange} />
      <DialogActions>
        <Button data-test-id="html-renderer" onClick={onClick}>
          Confirm
        </Button>
      </DialogActions>
    </>
  )
}

const HtmlPlugin = () => {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        INSERT_HTML_COMMAND,
        (payload) => {
          const { htmlContent } = payload || {}
          editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined)
          editor.update(
            () => {
              const parser = new DOMParser()
              const dom = parser.parseFromString(htmlContent || '', 'text/html')
              const nodes = $generateNodesFromDOM(editor, dom)
              $insertNodes(nodes)
              $setSelection(null)
            },
            { discrete: true }
          )
          return true
        },
        COMMAND_PRIORITY_EDITOR
      )
    )
  }, [editor])

  return null
}

export default HtmlPlugin
