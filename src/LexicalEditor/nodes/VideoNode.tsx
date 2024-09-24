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
  ElementFormatType,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  Spread,
} from 'lexical'

import { BlockWithAlignableContents } from '@lexical/react/LexicalBlockWithAlignableContents'
import {
  DecoratorBlockNode,
  SerializedDecoratorBlockNode,
} from '@lexical/react/LexicalDecoratorBlockNode'
import * as React from 'react'

type VideoComponentProps = Readonly<{
  className: Readonly<{
    base: string
    focus: string
  }>
  format: ElementFormatType | null
  nodeKey: NodeKey
  videoID: string
}>

function VideoComponent({
  className,
  format,
  nodeKey,
  videoID,
}: VideoComponentProps) {
  return (
    <BlockWithAlignableContents
      className={className}
      format={format}
      nodeKey={nodeKey}
    >
      {/* <iframe
       
        src={`https://www.Video-nocookie.com/embed/${videoID}`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen={true}
        title="Video video"
      /> */}

      <video width="560" className="lexical_video_plugin" height="315" controls>
        <source src={videoID} type="video/mp4" />
      </video>
    </BlockWithAlignableContents>
  )
}

export type SerializedVideoNode = Spread<
  {
    videoID: string
  },
  SerializedDecoratorBlockNode
>

function $convertVideoElement(
  domNode: HTMLElement
): null | DOMConversionOutput {
  const videoID = domNode.getAttribute('data-lexical-Video')
  if (videoID) {
    const node = $createVideoNode(videoID)
    return { node }
  }
  return null
}

export class VideoNode extends DecoratorBlockNode {
  __id: string

  static getType(): string {
    return 'Video'
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(node.__id, node.__format, node.__key)
  }

  static importJSON(serializedNode: SerializedVideoNode): VideoNode {
    const node = $createVideoNode(serializedNode.videoID)
    node.setFormat(serializedNode.format)
    return node
  }

  exportJSON(): SerializedVideoNode {
    return {
      ...super.exportJSON(),
      type: 'Video',
      version: 1,
      videoID: this.__id,
    }
  }

  constructor(id: string, format?: ElementFormatType, key?: NodeKey) {
    super(format, key)
    this.__id = id
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('video')
    element.className = 'lexical_video_plugin'
    element.setAttribute('data-lexical-Video', this.__id)
    element.setAttribute('width', '560')
    element.setAttribute('height', '315')
    element.setAttribute('controls', 'true')
    const sourceMp4 = document.createElement('source')
    sourceMp4.setAttribute('src', this.__id)
    sourceMp4.setAttribute('type', 'video/mp4')
    element.appendChild(sourceMp4)
    element.setAttribute('title', 'Video playback')
    return { element }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      video: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-Video')) {
          return null
        }
        return {
          conversion: $convertVideoElement,
          priority: 1,
        }
      },
    }
  }

  updateDOM(): false {
    return false
  }

  getId(): string {
    return this.__id
  }

  getTextContent(
    _includeInert?: boolean | undefined,
    _includeDirectionless?: false | undefined
  ): string {
    return `${this.__id}`
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    const embedBlockTheme = config.theme.embedBlock || {}
    const className = {
      base: embedBlockTheme.base || '',
      focus: embedBlockTheme.focus || '',
    }
    return (
      <VideoComponent
        className={className}
        format={this.__format}
        nodeKey={this.getKey()}
        videoID={this.__id}
      />
    )
  }
}

export function $createVideoNode(videoID: string): VideoNode {
  return new VideoNode(videoID)
}

export function $isVideoNode(
  node: VideoNode | LexicalNode | null | undefined
): node is VideoNode {
  return node instanceof VideoNode
}
