/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { CharacterLimitPlugin } from '@lexical/react/LexicalCharacterLimitPlugin'
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin'
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin'
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin'
import { TablePlugin } from './plugins/TablePlugin/LexicalTablePlugin.ts'
import { useLexicalEditable } from '@lexical/react/useLexicalEditable'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { CAN_USE_DOM } from './shared/canUseDOM.ts'
import { useSettings } from './context/SettingsContext.tsx'
import { useSharedHistoryContext } from './context/SharedHistoryContext.tsx'
import ActionsPlugin from './plugins/ActionsPlugin/index.tsx'
import AutocompletePlugin from './plugins/AutocompletePlugin/index.tsx'
import AutoEmbedPlugin from './plugins/AutoEmbedPlugin/AutoEmbedPlugin.js'
import AutoLinkPlugin from './plugins/AutoLinkPlugin/index.jsx'
import CodeActionMenuPlugin from './plugins/CodeActionMenuPlugin/index.tsx'
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin/index.ts'
import CollapsiblePlugin from './plugins/CollapsiblePlugin/index.ts'
import ComponentPickerPlugin from './plugins/ComponentPickerPlugin/index.tsx'
import ContextMenuPlugin from './plugins/ContextMenuPlugin/index.tsx'
import DragDropPaste from './plugins/DragDropPastePlugin/DragDropPastePlugin.js'
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin/index.tsx'
import EmojiPickerPlugin from './plugins/EmojiPickerPlugin/index.tsx'
import EmojisPlugin from './plugins/EmojisPlugin/index.ts'
import EquationsPlugin from './plugins/EquationsPlugin/index.tsx'
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin/index.tsx'
import FloatingTextFormatToolbarPlugin from './plugins/FloatingTextFormatToolbarPlugin/index.tsx'
import ImagesPlugin from './plugins/ImagesPlugin/index.tsx'
import KeywordsPlugin from './plugins/KeywordsPlugin/index.ts'
import { LayoutPlugin } from './plugins/LayoutPlugin/LayoutPlugin.tsx'
import LinkPlugin from './plugins/LinkPlugin/index.tsx'
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin/index.ts'
import MarkdownShortcutPlugin from './plugins/MarkdownShortcutPlugin/index.tsx'
import { MaxLengthPlugin } from './plugins/MaxLengthPlugin/index.tsx'
import MentionsPlugin from './plugins/MentionsPlugin/index.tsx'
import PageBreakPlugin from './plugins/PageBreakPlugin/index.tsx'
import SpeechToTextPlugin from './plugins/SpeechToTextPlugin/index.ts'
import TabFocusPlugin from './plugins/TabFocusPlugin/index.tsx'
import TableCellActionMenuPlugin from './plugins/TableActionMenuPlugin/index.tsx'
import TableCellResizer from './plugins/TableCellResizer/index.tsx'
import TableOfContentsPlugin from './plugins/TableOfContentsPlugin/index.tsx'
import YouTubePlugin from './plugins/YouTubePlugin/index.ts'
import ContentEditable from './ui/ContentEditable.tsx'
import Placeholder from './ui/Placeholder.tsx'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import { $insertNodes, $setSelection } from 'lexical'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import DocumentsPlugin from './plugins/Document/DocumentPlugin.js'
import HtmlPlugin from './plugins/HTMLPlugin/HtmlPlugin.js'
import ToolbarPlugin from './plugins/ToolbarPlugin/index.tsx'
import LandingPageToolbarPlugin from './plugins/LandingPages/LandingPageToolbar.tsx'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin'
import TableHoverActionsPlugin from './plugins/TableHoverActionsPlugin/index.tsx'
import DollarPlugin from './plugins/DollarPlugin/index.tsx'
import componentsEnum from '../enum/components.js'
import VideoPlugin from './plugins/Video/index.ts'
import { PiDotsThreeBold } from 'react-icons/pi'

const HtmlRenderer = ({ value }) => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    try {
      if (value) {
        editor.update(
          () => {
            const parser = new DOMParser()
            const dom = parser.parseFromString(value, 'text/html')
            const nodes = $generateNodesFromDOM(editor, dom)
            $insertNodes(nodes)
            $setSelection(null)
          },
          { discrete: true }
        )
      }
    } catch (error) {
      console.error(error)
    }
  }, [editor])
  return null
}

export default function Editor({
  value,
  onChange,
  mentionList,
  entity_type,
  entity_id,
  setFilesHandle,
  onDocumentUpdate,
  defaultStyles,
  variables,
  handleAutocompleteChange,
  componentName,
  onEmailThreadChange,
  emailReplyThread,
  isExternal,
  everyOne,
  placeholderText,
}) {
  function getInlineStyles(element) {
    const styles = {}
    const style = element?.style
    for (let i = 0; i < style?.length; i++) {
      const key = style[i]
      styles[key] = style[key]
    }
    return styles
  }

  function applyInlineStylesToLexicalMention(html) {
    try {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = html
      const lexicalMentionElements =
        tempDiv.querySelectorAll('.lexical_mention')
      lexicalMentionElements?.forEach((element) => {
        const previousSibling = element?.previousElementSibling
        const nextSibling = element?.nextElementSibling
        let styles = {}
        if (previousSibling) {
          styles = getInlineStyles(
            previousSibling ? previousSibling : `<span></span>`
          )
        } else if (nextSibling) {
          styles = getInlineStyles(nextSibling ? nextSibling : `<span></span>`)
        }

        Object?.keys(styles)?.forEach((style) => {
          element.style[style] = styles[style]
        })
        const mentionUserName = element.querySelector('.mention_user_name')
        if (mentionUserName) {
          Object.keys(styles)?.forEach((style) => {
            mentionUserName.style[style] = styles[style]
          })
        }
      })

      const ulListElements = tempDiv.querySelectorAll('.aroopa_editor__ul')
      ulListElements.forEach((element) => {
        const span = element.querySelector('span')
        let liststyles = {}
        if (span) {
          liststyles = getInlineStyles(span ? span : `<span></span>`)
        }
        Object?.keys(liststyles)?.forEach((style) => {
          element.style[style] = liststyles[style]
        })
        const listElements = element.querySelector('.aroopa_editor__listItem ')
        if (listElements) {
          Object.keys(liststyles)?.forEach((style) => {
            listElements.style[style] = liststyles[style]
          })
        }
      })

      const olListElements = tempDiv.querySelectorAll(
        '.aroopa_editor__ol1',
        '.aroopa_editor__ol2',
        '.aroopa_editor__ol3',
        '.aroopa_editor__ol4',
        '.aroopa_editor__ol5'
      )
      olListElements.forEach((element) => {
        const span = element.querySelector('span')
        let liststyles = {}
        if (span) {
          liststyles = getInlineStyles(span ? span : `<span></span>`)
        }
        Object?.keys(liststyles)?.forEach((style) => {
          element.style[style] = liststyles[style]
        })
        const listElements = element.querySelector('.aroopa_editor__listItem ')
        if (listElements) {
          Object.keys(liststyles)?.forEach((style) => {
            listElements.style[style] = liststyles[style]
          })
        }
      })
      return tempDiv.innerHTML
    } catch (error) {
      console.error(error)
    }
  }

  const { historyState } = useSharedHistoryContext()
  const [showTableOfContents, setShowTableOfContents] = useState(false)
  const [htmlContent, setHtmlContent] = useState('')
  const handleOnChange = React.useCallback((editorState, editor) => {
    try {
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor)
        const updatedHtml = applyInlineStylesToLexicalMention(html)
        onChange(updatedHtml)
        setHtmlContent(updatedHtml)
      })
    } catch (error) {
      console.error(error)
    }
  }, [])

  function transformMentions(htmlContent) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, 'text/html')
    const mentionElements = doc.querySelectorAll('span.mention')
    mentionElements.forEach((mentionElement) => {
      const dataValue = JSON.parse(mentionElement?.getAttribute('data-value'))
      const imgSrc = dataValue?.picture
      const userProfile = dataValue?.userProfile
        ? dataValue?.userProfile
        : `${
            dataValue?.firstName?.charAt(0)?.toUpperCase() +
            dataValue?.lastName?.charAt(0)?.toUpperCase()
          }`
      const firstName = dataValue?.firstName?.trim()
      const fullName = `${
        firstName?.charAt(0)?.toUpperCase() + firstName?.slice(1)?.toLowerCase()
      }`
      const newMentionElement = document.createElement('span')
      newMentionElement.setAttribute('data-lexical-mention', 'true')
      newMentionElement.className = 'lexical_mention'
      newMentionElement.setAttribute('_id', dataValue?._id)
      if (imgSrc !== '' && imgSrc !== undefined) {
        const imgElement = document.createElement('img')
        imgElement.className = 'mention_user_image'
        imgElement.src = imgSrc
        newMentionElement.appendChild(imgElement)
      } else {
        const mentionAvatar = document.createElement('span')
        mentionAvatar.className = 'mention-user-avatar'
        mentionAvatar.textContent = userProfile
        newMentionElement.appendChild(mentionAvatar)
      }
      const nameSpanElement = document.createElement('span')
      nameSpanElement.className = 'mention_user_name'
      nameSpanElement.textContent = fullName
      newMentionElement.appendChild(nameSpanElement)
      mentionElement.replaceWith(newMentionElement)
    })
    return doc.body.innerHTML
  }

  const transformedHtml = transformMentions(value ? value : '')
  const {
    settings: {
      isCollab,
      isAutocomplete,
      isMaxLength,
      isCharLimit,
      isCharLimitUtf8,
      showTreeView,
      shouldUseLexicalContextMenu,
      shouldPreserveNewLinesInMarkdown,
      tableCellMerge,
      tableCellBackgroundColor,
      isToolBarPresent,
    },
  } = useSettings()
  const isEditable = useLexicalEditable()

  const placeholder = (
    <Placeholder>
      {placeholderText ? placeholderText : 'Enter Text...'}
    </Placeholder>
  )
  const [floatingAnchorElem, setFloatingAnchorElem] = useState(null)
  const [isSmallWidthViewport, setIsSmallWidthViewport] = useState(false)
  const [isLinkEditMode, setIsLinkEditMode] = useState(false)
  const [toggleEmailThread, setToggleEmailThread] = useState(false)
  const [isRichText, setIsRichText] = useState(
    componentName === componentsEnum?.Chat ? false : true
  )

  const onRef = React.useCallback((_floatingAnchorElem) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem)
    }
  }, [])

  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport =
        CAN_USE_DOM && window.matchMedia('(max-width: 1025px)').matches
      if (isNextSmallWidthViewport !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNextSmallWidthViewport)
      }
    }
    updateViewPortWidth()
    window.addEventListener('resize', updateViewPortWidth)
    return () => {
      window.removeEventListener('resize', updateViewPortWidth)
    }
  }, [isSmallWidthViewport])

  const commonPlugins = (
    <>
      {isMaxLength && <MaxLengthPlugin maxLength={30} />}
      <DragDropPaste
        setFilesHandle={setFilesHandle}
        onDocumentUpdate={onDocumentUpdate}
        componentName={componentName}
      />
      <AutoFocusPlugin />
      <ClearEditorPlugin />
      <ComponentPickerPlugin />
      <EmojiPickerPlugin />
      <AutoEmbedPlugin />
      {transformedHtml && <HtmlRenderer value={transformedHtml ?? ''} />}{' '}
      {isAutocomplete && <AutocompletePlugin />}
      <EmojisPlugin />
      <HashtagPlugin />
      <KeywordsPlugin />
      <SpeechToTextPlugin />
      <AutoLinkPlugin />
      {isToolBarPresent ? (
        <>
          <HistoryPlugin externalHistoryState={historyState} />
          <RichTextPlugin
            contentEditable={
              <div className="editor-scroller">
                <div className="lexical_editor" ref={onRef}>
                  <ContentEditable />
                  {componentName === componentsEnum?.TicketDetails && (
                    <div>
                      <button
                        className="toolbar-item"
                        style={{ marginLeft: '20px' }}
                        onClick={() => {
                          setToggleEmailThread((prev) => !prev)
                        }}
                      >
                        <PiDotsThreeBold style={{ fontSize: '16px' }} />
                      </button>
                      {toggleEmailThread &&
                        emailReplyThread(
                          <div
                            style={{ padding: '10px' }}
                            contentEditable={true}
                            onInput={onEmailThreadChange}
                            dangerouslySetInnerHTML={{
                              __html: emailReplyThread ?? '',
                            }}
                          />
                        )}
                    </div>
                  )}
                </div>
              </div>
            }
            placeholder={placeholder}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <MarkdownShortcutPlugin />
          <CodeHighlightPlugin />
          <ListPlugin />
          <CheckListPlugin />
          <ListMaxIndentLevelPlugin maxDepth={7} />
          <TablePlugin
            hasCellMerge={tableCellMerge}
            hasCellBackgroundColor={tableCellBackgroundColor}
          />
          <VideoPlugin />
          <TableCellResizer />
          <TableHoverActionsPlugin />
          <ImagesPlugin />
          <LinkPlugin />
          <YouTubePlugin />
          <HtmlPlugin onChange={onChange} />
          <ClickableLinkPlugin disabled={isEditable} />
          <HorizontalRulePlugin />
          <EquationsPlugin />
          <TabFocusPlugin />
          <TabIndentationPlugin />
          <CollapsiblePlugin />
          <OnChangePlugin onChange={handleOnChange} />
          <PageBreakPlugin />
          <LayoutPlugin />

          {floatingAnchorElem && (
            <>
              <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
              <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
              <FloatingLinkEditorPlugin
                anchorElem={floatingAnchorElem}
                isLinkEditMode={isLinkEditMode}
                setIsLinkEditMode={setIsLinkEditMode}
              />
              <TableCellActionMenuPlugin
                anchorElem={floatingAnchorElem}
                cellMerge={true}
              />

              <FloatingTextFormatToolbarPlugin
                anchorElem={floatingAnchorElem}
                setIsLinkEditMode={setIsLinkEditMode}
                componentName={componentName}
              />
            </>
          )}
        </>
      ) : (
        <>
          <PlainTextPlugin
            contentEditable={<ContentEditable />}
            placeholder={placeholder}
            ErrorBoundary={LexicalErrorBoundary}
          />

          <HistoryPlugin externalHistoryState={historyState} />
        </>
      )}
      {(isCharLimit || isCharLimitUtf8) && (
        <CharacterLimitPlugin
          charset={isCharLimit ? 'UTF-16' : 'UTF-8'}
          maxLength={5}
        />
      )}
      {showTableOfContents && <TableOfContentsPlugin />}
      {shouldUseLexicalContextMenu && <ContextMenuPlugin />}
    </>
  )

  const ToolbarPluginInstance = (
    // <ToolbarPlugin
    //   setIsLinkEditMode={setIsLinkEditMode}
    //   setShowTableOfContents={setShowTableOfContents}
    //   htmlContent={htmlContent}
    //   variables={variables}
    //   handleAutocompleteChange={handleAutocompleteChange}
    //   componentName={componentName}
    // />
    <></>
  )

  const MentionPluginInstance = (
    <MentionsPlugin
      mentionList={mentionList}
      entity_type={entity_type}
      entity_id={entity_id}
      anchorElem={floatingAnchorElem}
      componentName={componentName}
      everyOne={everyOne}
      isExternal={isExternal}
    />
  )

  const ActionPluginInstance = (
    <ActionsPlugin
      isRichText={isRichText}
      setIsRichText={setIsRichText}
      shouldPreserveNewLinesInMarkdown={shouldPreserveNewLinesInMarkdown}
      componentName={componentName}
    />
  )

  const DocumentPluginInstance = (
    <DocumentsPlugin
      setFilesHandle={setFilesHandle}
      onDocumentUpdate={onDocumentUpdate}
    />
  )

  // Function to render the Required plugins based on the componenet

  const renderPlugin = ({ componentName }) => {
    //Configure Editor Based on the component componentName
    try {
      switch (componentName) {
        case componentsEnum?.Wiki:
          return (
            <>
              {isRichText && ToolbarPluginInstance}

              <div
                className={`editor-container ${
                  showTreeView ? 'tree-view' : ''
                } ${!isRichText ? 'plain-text' : ''}`}
              >
                {MentionPluginInstance}
                {ActionPluginInstance}
                {DocumentPluginInstance}
                {commonPlugins}
              </div>
            </>
          )
        case componentsEnum?.MessageBoard:
        case componentsEnum?.Projects:
        case componentsEnum?.Spaces:
        case componentsEnum?.Chat:
          return (
            <>
              {isRichText && ToolbarPluginInstance}
              {isRichText && <hr />}
              <div
                className={`editor-container ${
                  showTreeView ? 'tree-view' : ''
                } ${!isRichText ? 'plain-text' : ''}`}
              >
                {MentionPluginInstance}
                {ActionPluginInstance}
                {DocumentPluginInstance}
                {commonPlugins}
              </div>
            </>
          )
        case componentsEnum?.LandingPages:
          return (
            <>
              {' '}
              <LandingPageToolbarPlugin
                setIsLinkEditMode={setIsLinkEditMode}
                defaultStyles={defaultStyles}
              />
              <div
                className={`editor-container ${
                  showTreeView ? 'tree-view' : ''
                } ${!isRichText ? 'plain-text' : ''}`}
              >
                {commonPlugins}
              </div>
            </>
          )

        case componentsEnum?.ManageTemplates:
          return (
            <>
              {isRichText && ToolbarPluginInstance}

              <div
                className={`editor-container ${
                  showTreeView ? 'tree-view' : ''
                } ${!isRichText ? 'plain-text' : ''}`}
              >
                <DollarPlugin variables={variables} />
                {commonPlugins}
                {ActionPluginInstance}
              </div>
            </>
          )
        case componentsEnum?.Campaign:
          return (
            <>
              {isRichText && ToolbarPluginInstance}

              <div
                className={`editor-container ${
                  showTreeView ? 'tree-view' : ''
                } ${!isRichText ? 'plain-text' : ''}`}
              >
                <DollarPlugin variables={variables} />
                {commonPlugins}
                {ActionPluginInstance}
              </div>
            </>
          )
        case componentsEnum?.Flows:
          return (
            <>
              {isRichText && ToolbarPluginInstance}

              <div
                className={`editor-container ${
                  showTreeView ? 'tree-view' : ''
                } ${!isRichText ? 'plain-text' : ''}`}
              >
                {commonPlugins}
                {ActionPluginInstance}
              </div>
            </>
          )
        case componentsEnum?.TicketDetails:
          return (
            <>
              {isRichText && ToolbarPluginInstance}

              <div
                className={`editor-container ${
                  showTreeView ? 'tree-view' : ''
                } ${!isRichText ? 'plain-text' : ''}`}
              >
                {commonPlugins}
                {ActionPluginInstance}
              </div>
            </>
          )
        case componentsEnum?.Remainder:
          return (
            <>
              {isRichText && ToolbarPluginInstance}

              <div
                className={`editor-container ${
                  showTreeView ? 'tree-view' : ''
                } ${!isRichText ? 'plain-text' : ''}`}
              >
                {commonPlugins}
                {MentionPluginInstance}
                {ActionPluginInstance}
              </div>
            </>
          )
        default:
          return (
            <>
              {isRichText && ToolbarPluginInstance}

              <div
                className={`editor-container ${
                  showTreeView ? 'tree-view' : ''
                } ${!isRichText ? 'plain-text' : ''}`}
              >
                {commonPlugins}
              </div>
            </>
          )
      }
    } catch (error) {
      console.error(error)
    }
  }

  return <div>{renderPlugin({ componentName })}</div>
}
