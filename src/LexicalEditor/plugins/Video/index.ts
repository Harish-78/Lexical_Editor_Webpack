/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodeToNearestRoot } from '@lexical/utils'
import { COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand } from 'lexical'
import { useEffect } from 'react'
import { $createVideoNode, VideoNode } from '../../nodes/VideoNode.tsx'

export const INSERT_VIDEO_COMMAND: LexicalCommand<string> = createCommand(
  'INSERT_VIDEO_COMMAND'
)

export default function VideoPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    try {
      if (!editor.hasNodes([VideoNode])) {
        throw new Error('VideoPlugin: Video not registered on editor')
      }

      return editor.registerCommand<string>(
        INSERT_VIDEO_COMMAND,
        (payload) => {
          const videoNode = $createVideoNode(payload)
          $insertNodeToNearestRoot(videoNode)

          return true
        },
        COMMAND_PRIORITY_EDITOR
      )
    } catch (error) {
      console.error(error)
    }
  }, [editor])

  return null
}
