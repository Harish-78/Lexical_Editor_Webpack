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
    signature: string
  },
  SerializedTextNode
>

function $convertSignatureElement(
  domNode: HTMLElement
): DOMConversionOutput | null {
  const textContent = domNode.innerHTML

  if (textContent !== null) {
    const node = $createSignatureNode(textContent)
    return {
      node,
    }
  }

  return null
}

export class SignatureNode extends TextNode {
  __signature: string

  static getType(): string {
    return 'signature'
  }

  static clone(node: SignatureNode): SignatureNode {
    return new SignatureNode(node.__signature)
  }
  static importJSON(serializedNode: SerializedMentionNode): SignatureNode {
    const node = $createSignatureNode(serializedNode.signature)
    node.setFormat(serializedNode.format)
    node.setDetail(serializedNode.detail)
    node.setMode(serializedNode.mode)
    node.setStyle(serializedNode.style)
    return node
  }

  constructor(signature: string, text?: string, key?: NodeKey) {
    super(text ?? signature, key)
    this.__signature = signature
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      signature: this.__signature,

      type: 'signature',
      version: 1,
    }
  }

  createDOM(): HTMLElement {
    const dom = document.createElement('p')
    dom.className = 'template-signature'
    dom.innerHTML = this.__signature
    return dom
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('p')
    element.setAttribute('data-lexical-signature', 'true')
    element.innerHTML = this.__signature
    console.log({ element })
    return { element }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-signature')) {
          return null
        }
        return {
          conversion: $convertSignatureElement,
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

export function $createSignatureNode(signature: string): SignatureNode {
  console.log({ signature })
  const signatureNode = new SignatureNode(signature)
  console.log({ signatureNode })
  signatureNode.setMode('segmented').toggleDirectionless()
  return $applyNodeReplacement(signatureNode)
}

export function $isSignatureNode(
  node: LexicalNode | null | undefined
): node is SignatureNode {
  return node instanceof SignatureNode
}
