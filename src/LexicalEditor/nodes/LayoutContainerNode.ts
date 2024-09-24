/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
} from 'lexical'

import { ElementNode } from 'lexical'

function getInlineStyles(element: HTMLElement) {
  try {
    const styles = {}
    const style = element?.style
    for (let i = 0; i < style?.length; i++) {
      const key = style[i]
      styles[key] = style[key]
    }
    return styles
  } catch (error) {
    console.error(error)
  }
}

export type SerializedLayoutContainerNode = Spread<
  {
    templateColumns: string
  },
  SerializedElementNode
>

function $convertLayoutContainerElement(
  domNode: HTMLElement
): DOMConversionOutput | null {
  const styleAttributes = getInlineStyles(domNode)
  const templateColumns = styleAttributes['grid-template-columns']
  if (templateColumns) {
    const node = $createLayoutContainerNode(templateColumns)
    return { node }
  }
  return null
}

export class LayoutContainerNode extends ElementNode {
  __templateColumns: string

  constructor(templateColumns: string, key?: NodeKey) {
    super(key)
    this.__templateColumns = templateColumns
  }

  static getType(): string {
    return 'layout-container'
  }

  static clone(node: LayoutContainerNode): LayoutContainerNode {
    return new LayoutContainerNode(node.__templateColumns, node.__key)
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('div')
    dom.className = 'aroopa_editor__layoutContainer'
    dom.setAttribute('data-lexical-layout-container', 'true')
    dom.style.gridTemplateColumns = this.__templateColumns
    return dom
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.style.gridTemplateColumns = this.__templateColumns
    element.className = 'aroopa_editor__layoutContainer'
    element.setAttribute('data-lexical-layout-container', 'true')
    return { element }
  }

  updateDOM(prevNode: LayoutContainerNode, dom: HTMLElement): boolean {
    if (prevNode.__templateColumns !== this.__templateColumns) {
      dom.style.gridTemplateColumns = this.__templateColumns
    }
    return false
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-layout-container')) {
          return null
        }
        return {
          conversion: $convertLayoutContainerElement,
          priority: 2,
        }
      },
    }
  }

  static importJSON(json: SerializedLayoutContainerNode): LayoutContainerNode {
    return $createLayoutContainerNode(json.templateColumns)
  }

  isShadowRoot(): boolean {
    return true
  }

  canBeEmpty(): boolean {
    return false
  }

  exportJSON(): SerializedLayoutContainerNode {
    return {
      ...super.exportJSON(),
      templateColumns: this.__templateColumns,
      type: 'layout-container',
      version: 1,
    }
  }

  getTemplateColumns(): string {
    return this.getLatest().__templateColumns
  }

  setTemplateColumns(templateColumns: string) {
    this.getWritable().__templateColumns = templateColumns
  }
}

export function $createLayoutContainerNode(
  templateColumns: string
): LayoutContainerNode {
  return new LayoutContainerNode(templateColumns)
}

export function $isLayoutContainerNode(
  node: LexicalNode | null | undefined
): node is LayoutContainerNode {
  return node instanceof LayoutContainerNode
}
