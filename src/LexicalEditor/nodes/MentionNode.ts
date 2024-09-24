/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  $applyNodeReplacement,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedTextNode,
  type Spread,
  TextNode,
} from 'lexical'

export type SerializedMentionNode = Spread<
  {
    mentionName: string
    mentionAvatar: string
    mentionID: string
    inLinestyles: Object
  },
  SerializedTextNode
>

function $convertMentionElement(
  domNode: HTMLElement
): DOMConversionOutput | null {
  const name = domNode?.querySelector('.mention_user_name')?.textContent ?? ''
  let imageUrl = domNode.querySelector('img')?.getAttribute('src') ?? ''
  const mentionUserImage =
    domNode?.querySelector('.mention-user-avatar')?.textContent ?? ''
  const _id = domNode?.getAttribute('_id')
  function getInlineStyles(element) {
    const styles = {}
    const style = element.style
    for (let i = 0; i < style.length; i++) {
      const key = style[i]
      styles[key] = style[key]
    }
    return styles
  }

  const inLinestyles = getInlineStyles(domNode)
  try {
    if (
      (imageUrl === '' || imageUrl === null || imageUrl === undefined) &&
      mentionUserImage !== ''
    ) {
      if (name !== null && mentionUserImage !== null && _id !== null) {
        const node = $createMentionNode(
          name,
          mentionUserImage,
          _id,
          inLinestyles
        )
        return {
          node,
        }
      }
    } else {
      if (name !== null && imageUrl !== null && _id !== null) {
        const node = $createMentionNode(name, imageUrl, _id, inLinestyles)
        return {
          node,
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
  return null
}

export class MentionNode extends TextNode {
  __mention: string
  __imageURL: string
  __id: string
  __inLinestyles: Object
  static getType(): string {
    return 'mention'
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(
      node.__mention,
      node.__imageURL,
      node.__id,
      node.__inLinestyles,
      node.__text,
      node.__key
    )
  }
  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const node = $createMentionNode(
      serializedNode.mentionName,
      serializedNode.mentionAvatar,
      serializedNode.mentionID,
      serializedNode.inLinestyles
    )
    node.setTextContent(serializedNode.text)
    node.setFormat(serializedNode.format)
    node.setDetail(serializedNode.detail)
    node.setMode(serializedNode.mode)
    node.setStyle(serializedNode.style)
    return node
  }

  constructor(
    mentionName: string,
    mentionAvatar: string,
    mentionID: string,
    inLinestyles: Object,
    text?: string,
    key?: NodeKey
  ) {
    super(text ?? mentionName, key)
    this.__mention = mentionName
    this.__imageURL = mentionAvatar
    this.__id = mentionID
    this.__inLinestyles = inLinestyles
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      mentionName: this.__mention,
      mentionAvatar: this.__imageURL,
      mentionID: this.__id,
      inLinestyles: this.__inLinestyles,
      type: 'mention',
      version: 1,
    }
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement('span')
    const regex = /^[A-Z]{2}$/
    const isMatch = regex.test(this.__imageURL)
    if (this.__imageURL !== '' && this.__imageURL !== undefined) {
      if (isMatch) {
        const mentionUserAvatar = document.createElement('span')
        mentionUserAvatar.className = 'mention-user-avatar'
        mentionUserAvatar.style.fontSize = '13px'
        mentionUserAvatar.style.borderRadius = '50%'
        mentionUserAvatar.style.backgroundColor = '#ccc'
        mentionUserAvatar.style.marginLeft = '2px'
        mentionUserAvatar.style.marginRight = '5px'
        mentionUserAvatar.style.padding = '3px'
        mentionUserAvatar.textContent = this.__imageURL
        element.append(mentionUserAvatar)
      } else {
        const imageElement = document.createElement('img')
        imageElement.className = 'mention_user_image'
        imageElement.style.width = '20px'
        imageElement.style.height = '20px'
        imageElement.style.borderRadius = '25px'
        imageElement.style.marginRight = '5px'
        imageElement.style.position = 'relative'
        imageElement.style.top = '3px'
        imageElement.setAttribute('src', this.__imageURL)
        element.append(imageElement)
      }
    }

    element.setAttribute('data-lexical-mention', 'true')
    element.setAttribute('_id', this.__id)

    const dom = super.createDOM(config)
    dom.className = 'mention_user_name'
    element.append(dom)
    Object.keys(this.__inLinestyles)?.length
      ? Object?.keys(this.__inLinestyles)?.forEach((style) => {
          element.style[style] = this.__inLinestyles[style]
        })
      : (element.style.fontSize = '14px')
    element.className = 'lexical_mention'
    element.className = 'lexical_mention'
    element.style.backgroundColor = 'rgba(24, 119, 232, 0.2)'
    element.style.padding = '5px'
    element.style.borderRadius = '5px'
    element.style.lineHeight = '1.8'
    element.style.whiteSpace = 'nowrap'

    return element
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span')
    const regex = /^[A-Z]{2}$/
    const isMatch = regex.test(this.__imageURL)

    if (this.__imageURL !== '' && this.__imageURL !== undefined) {
      if (isMatch) {
        const mentionUserAvatar = document.createElement('span')
        mentionUserAvatar.className = 'mention-user-avatar'
        mentionUserAvatar.style.fontSize = '13px'
        mentionUserAvatar.style.borderRadius = '50%'
        mentionUserAvatar.style.backgroundColor = '#ccc'
        mentionUserAvatar.style.marginLeft = '2px'
        mentionUserAvatar.style.marginRight = '5px'
        mentionUserAvatar.style.padding = '3px'
        mentionUserAvatar.textContent = this.__imageURL
        element.append(mentionUserAvatar)
      } else {
        const imageElement = document.createElement('img')
        imageElement.className = 'mention_user_image'
        imageElement.style.width = '20px'
        imageElement.style.height = '20px'
        imageElement.style.borderRadius = '25px'
        imageElement.style.marginRight = '5px'
        imageElement.style.position = 'relative'
        imageElement.style.top = '3px'
        imageElement.setAttribute('src', this.__imageURL)
        element.append(imageElement)
      }
    }

    element.setAttribute('data-lexical-mention', 'true')
    element.setAttribute('_id', this.__id)
    const spanElement = document.createElement('span')
    spanElement.className = 'mention_user_name'
    spanElement.textContent = this.__mention
    element.append(spanElement)

    Object.keys(this.__inLinestyles)?.length
      ? Object?.keys(this.__inLinestyles)?.forEach((style) => {
          element.style[style] = this.__inLinestyles[style]
        })
      : (element.style.fontSize = '14px')
    element.className = 'lexical_mention'
    element.style.backgroundColor = 'rgba(24, 119, 232, 0.2)'
    element.style.padding = '5px'
    element.style.borderRadius = '5px'
    element.style.lineHeight = '1.8'
    element.style.whiteSpace = 'nowrap'
    return { element }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-mention')) {
          return null
        }
        return {
          conversion: $convertMentionElement,
          priority: 1,
        }
      },
    }
  }

  isTextEntity(): true {
    return true
  }

  canInsertTextBefore(): boolean {
    return false
  }

  canInsertTextAfter(): boolean {
    return false
  }
}

export function $createMentionNode(
  mentionName: string,
  mentionAvatar: string,
  mentionID: string,
  inLinestyles: Object
): MentionNode {
  try {
    const mentionNode = new MentionNode(
      mentionName,
      mentionAvatar,
      mentionID,
      inLinestyles
    )
    mentionNode.setMode('segmented').toggleDirectionless()
    return $applyNodeReplacement(mentionNode)
  } catch (error) {
    console.log(error)
  }
}

export function $isMentionNode(
  node: LexicalNode | null | undefined
): node is MentionNode {
  return node instanceof MentionNode
}
