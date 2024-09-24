/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { DRAG_DROP_PASTE } from '@lexical/rich-text'
import { isMimeType, mediaFileReader } from '@lexical/utils'
import { COMMAND_PRIORITY_LOW } from 'lexical'
import { useEffect } from 'react'

import { INSERT_IMAGE_COMMAND } from '../ImagesPlugin/index.tsx'
import ImageCompress from '../../../MessageBoard/ImageCompress.jsx'
import PresignedUrl from '../../../MessageBoard/PresignedUrl.jsx'
import { message } from 'antd'
import { getBase64 } from '../Document/DocumentPlugin.js'
import { INSERT_VIDEO_COMMAND } from '../Video/index.ts'
import componentsEnum from '../../../enum/components.js'

const ACCEPTABLE_IMAGE_TYPES = [
  'image/',
  'image/heic',
  'image/heif',
  'image/gif',
  'image/webp',
]

export default function DragDropPaste({
  setFilesHandle,
  onDocumentUpdate,
  componentName,
}) {
  const [editor] = useLexicalComposerContext()

  const getPresignedUrl = async ({ droppedFile }) => {
    try {
      await getBase64(droppedFile).then(async (result) => {
        droppedFile['base64'] = await PresignedUrl({
          name: [droppedFile?.name],
          file: result,
          type: droppedFile?.type,
        })
        return droppedFile
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  useEffect(() => {
    return editor.registerCommand(
      DRAG_DROP_PASTE,
      (files) => {
        ;(async () => {
          console.log({ files })
          const filesResult = await mediaFileReader(
            files,
            [ACCEPTABLE_IMAGE_TYPES]?.flatMap((x) => x)
          )
          for (const { file, result } of filesResult) {
            console.log({ file, result })
            if (isMimeType(file, ACCEPTABLE_IMAGE_TYPES)) {
              message.loading('Please wait to load the image', 0)
              const base64 = await ImageCompress({ base64String: file })

              const data = {}
              const currentUnixTimestamp = Math.floor(Date.now() / 1000)
              data.blobNames = [`${currentUnixTimestamp}-${file?.name}`]
              data.containerName = 'documents'
              try {
                const presignedUrl = await PresignedUrl({
                  name: data.blobNames,
                  file: base64,
                  type: file?.type,
                  filePath: data.containerName,
                })

                if (presignedUrl) {
                  editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                    altText: file.name,
                    src: presignedUrl,
                    srcArray: [],
                  })
                  message.destroy()
                }
              } catch (error) {
                console.error(error)
              }
            }
          }

          if (files?.length) {
            const droppedFile = files?.[0]

            if (droppedFile?.type?.includes('video')) {
              message.loading(`Please wait to load ${droppedFile?.name}`)
              const updatedDroppedFile = await getPresignedUrl({ droppedFile })
              console.log({ updatedDroppedFile })

              if (droppedFile?.type?.includes('video')) {
                message.destroy()
                editor.dispatchCommand(
                  INSERT_VIDEO_COMMAND,
                  droppedFile?.base64
                )
              }
            } else {
              switch (componentName) {
                case componentsEnum?.Wiki:
                  setFilesHandle((prev) => {
                    const data = [...prev, ...droppedFile?.base64]
                    onDocumentUpdate &&
                      onDocumentUpdate({
                        createdDocuments: data,
                      })
                    return data
                  })
                  break
                case componentsEnum?.Campaign:
                  message.info(
                    "Media Files other than Image and videos aren't allowed here"
                  )
                  break
                default:
                  message.info(
                    "Media Files other than Image and videos aren't allowed here"
                  )
              }
            }
          }
        })()
        return true
      },
      COMMAND_PRIORITY_LOW
    )
  }, [editor])
  return null
}
