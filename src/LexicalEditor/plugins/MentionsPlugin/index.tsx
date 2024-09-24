/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  MenuTextMatch,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin'
import { $createTextNode, TextNode } from 'lexical'
import { useCallback, useEffect, useMemo, useState } from 'react'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { $createMentionNode } from '../../nodes/MentionNode.ts'
import axios from 'axios'
import debounce from 'lodash/debounce'

const PUNCTUATION =
  '\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%\'"~=<>_:;'
const NAME = '\\b[A-Z][^\\s' + PUNCTUATION + ']'

const DocumentMentionsRegex = {
  NAME,
  PUNCTUATION,
}

const PUNC = DocumentMentionsRegex.PUNCTUATION
const apiUrl = 'http://localhost:8083'

const TRIGGERS = ['@'].join('')

// Chars we expect to see in a mention (non-space, non-punctuation).
const VALID_CHARS = '[^' + TRIGGERS + PUNC + '\\s]'

// Non-standard series of chars. Each series must be preceded and followed by
// a valid char.
const VALID_JOINS =
  '(?:' +
  '\\.[ |$]|' + // E.g. "r. " in "Mr. Smith"
  ' |' + // E.g. " " in "Josh Duck"
  '[' +
  PUNC +
  ']|' + // E.g. "-' in "Salier-Hellendag"
  ')'

const LENGTH_LIMIT = 75

const AtSignMentionsRegex = new RegExp(
  '(^|\\s|\\()(' +
    '[' +
    TRIGGERS +
    ']' +
    '((?:' +
    VALID_CHARS +
    VALID_JOINS +
    '){0,' +
    LENGTH_LIMIT +
    '})' +
    ')$'
)

// 50 is the longest alias length limit.
const ALIAS_LENGTH_LIMIT = 50

// Regex used to match alias.
const AtSignMentionsRegexAliasRegex = new RegExp(
  '(^|\\s|\\()(' +
    '[' +
    TRIGGERS +
    ']' +
    '((?:' +
    VALID_CHARS +
    '){0,' +
    ALIAS_LENGTH_LIMIT +
    '})' +
    ')$'
)

// At most, 5 suggestions are shown in the popup.
const SUGGESTION_LIST_LENGTH_LIMIT = 5

function useMentionLookupService(
  mentionString: string | null,
  entity_type: any,
  entity_id: any,
  componentName: any,
  isExternal: any,
  everyOne: any
) {
  const [results, setResults] = useState<Array<string>>([])

  const fetchUsers = async (
    mentionString: string | null,
    entity_type: any,
    entity_id: any,
    componentName: any,
    isExternal: any,
    everyOne: Boolean
  ) => {
    try {
      if (mentionString === null || mentionString === '') {
        setResults([])
        return
      }

      await debouncedGetUsers(
        mentionString,
        entity_type,
        entity_id,
        componentName,
        isExternal,
        everyOne,
        setResults
      )
    } catch (error) {
      console.error(error)
    }
  }
  useEffect(() => {
    fetchUsers(
      mentionString,
      entity_type,
      entity_id,
      componentName,
      isExternal,
      everyOne
    )
  }, [mentionString])

  return results
}

function checkForAtSignMentions(
  text: string,
  minMatchLength: number
): MenuTextMatch | null {
  let match = AtSignMentionsRegex.exec(text)
  if (match === null) {
    match = AtSignMentionsRegexAliasRegex.exec(text)
  }
  if (match !== null) {
    // The strategy ignores leading whitespace but we need to know it's
    // length to add it to the leadOffset
    const maybeLeadingWhitespace = match[1]

    const matchingString = match[3]
    if (matchingString.length >= minMatchLength) {
      return {
        leadOffset: match.index + maybeLeadingWhitespace.length,
        matchingString,
        replaceableString: match[2],
      }
    }
  }
  return null
}

function getPossibleQueryMatch(text: string): MenuTextMatch | null {
  return checkForAtSignMentions(text, 1)
}

let cancelTokenSource
const everyOneIcon =
  'https://aroopa.blob.core.windows.net/documents/vectors/people.png'

const everyOneData = {
  _id: 'everyone',
  email: 'Everyone',
  firstName: 'Everyone',
  lastName: '',
  picture: everyOneIcon,
  fullName: 'Everyone',
  displayName: 'Everyone',
}

interface User {
  _id: string
  email: string
  firstName: string
  lastName: string
  picture: string
  fullName: string
  displayName?: string
}

const debouncedGetUsers = debounce(
  async (
    searchTerm: string,
    entity_type,
    entity_id,
    componentName,
    isExternal = true,
    everyOne = false,
    renderList
  ) => {
    try {
      if (cancelTokenSource) {
        cancelTokenSource.cancel('Operation canceled by the user.')
      }

      cancelTokenSource = axios.CancelToken.source()

      if (searchTerm && searchTerm !== '' && searchTerm?.length >= 2) {
        const response = await axios.get(
          `${apiUrl}/api/users/all_user/?userName=${searchTerm}&entity_type=${entity_type}&entity_id=${entity_id}&external=${isExternal}`,
          {
            cancelToken: cancelTokenSource.token,
          }
        )

        let values: User[] = response.data.data
        if (values) {
          values = values?.filter(
            (value) => value?.firstName && value?.lastName
          )
          const seenNames = new Set()
          const uniqueValues = values?.filter((value) => {
            const fullName = `${value?.firstName}  ${value?.lastName}`
            if (seenNames?.has(fullName)) {
              return false
            }
            seenNames?.add(fullName)
            return true
          })

          if (everyOne) {
            uniqueValues.push(everyOneData)
          }

          renderList(uniqueValues)
        } else {
          if (everyOne) {
            renderList(everyOneData)
          }
        }
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('Error fetching data:', error)
      }
    }
  },
  500
)

class MentionTypeaheadOption extends MenuOption {
  name: string
  picture: JSX.Element
  _id: string
  firstName: string
  userProfile: string
  constructor(
    name: string,
    picture: JSX.Element,
    _id: string,
    firstName: string,
    userProfile: string
  ) {
    super(name)
    this.name = name
    this.picture = picture
    this._id = _id
    this.firstName = firstName
    this.userProfile = userProfile
  }
}

function MentionsTypeaheadMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number
  isSelected: boolean
  onClick: () => void
  onMouseEnter: () => void
  option: MentionTypeaheadOption
}) {
  let className = 'item'
  if (isSelected) {
    className += ' selected'
  }

  return (
    <li
      key={option.key}
      tabIndex={-1}
      className={className}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={'typeahead-item-' + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      {option.picture}
      <span className="text">{option.name}</span>
    </li>
  )
}

export default function NewMentionsPlugin({
  mentionList,
  entity_type,
  entity_id,
  componentName,
  isExternal,
  everyOne,
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  const [queryString, setQueryString] = useState(null)
  const results = useMentionLookupService(
    queryString,
    entity_type,
    entity_id,
    componentName,
    isExternal,
    everyOne
  )

  const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
    minLength: 0,
  })

  const options = useMemo(
    () =>
      results
        ?.map((result) => {
          const avatar = result?.picture ? (
            <img
              src={result?.picture}
              alt={result?.firstName?.charAt(0).toUpperCase()}
              className="mention_avatar"
            />
          ) : (
            <div className="mention_user_avatar">{result?.userProfile}</div>
          )

          return new MentionTypeaheadOption(
            `${
              result?.firstName?.charAt(0)?.toUpperCase() +
              result?.firstName?.slice(1)?.toLowerCase() +
              ' ' +
              result?.lastName?.charAt(0)?.toUpperCase() +
              result?.lastName?.slice(1)?.toLowerCase()
            }`,
            avatar,
            result?._id,
            result?.firstName?.charAt(0)?.toUpperCase() +
              result?.firstName?.slice(1)?.toLowerCase(),
            result?.userProfile
          )
        })
        ?.slice(0, SUGGESTION_LIST_LENGTH_LIMIT),
    [results]
  )
  const onSelectOption = useCallback(
    (
      selectedOption: MentionTypeaheadOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void
    ) => {
      const styles = { '': '' }
      const mantionAvatar =
        selectedOption?.picture?.props?.src ||
        selectedOption?.picture?.props?.children
      editor.update(() => {
        const mentionNode = $createMentionNode(
          selectedOption.firstName,
          mantionAvatar,
          selectedOption?._id,
          styles
        )
        if (nodeToReplace) {
          nodeToReplace?.replace(mentionNode)
          const textNode = $createTextNode(' ')
          mentionNode.insertAfter(textNode)
          textNode.select()
        }
        closeMenu()
      })
    },
    [editor]
  )

  const checkForMentionMatch = useCallback(
    (text: string) => {
      const slashMatch = checkForSlashTriggerMatch(text, editor)
      if (slashMatch !== null) {
        return null
      }
      return getPossibleQueryMatch(text)
    },
    [checkForSlashTriggerMatch, editor]
  )

  const handleMentionID = (option: MentionTypeaheadOption) => {
    if (option) {
      mentionList?.push(option?._id)
    }
  }

  return (
    <LexicalTypeaheadMenuPlugin<MentionTypeaheadOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForMentionMatch}
      options={options}
      handleMentionId={handleMentionID}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
      ) =>
        anchorElementRef.current && results.length
          ? ReactDOM.createPortal(
              <div className="typeahead-popover mentions-menu">
                <ul>
                  {options?.length
                    ? options.map((option, i: number) => (
                        <MentionsTypeaheadMenuItem
                          index={i}
                          isSelected={selectedIndex === i}
                          onClick={() => {
                            setHighlightedIndex(i)
                            selectOptionAndCleanUp(option)
                            handleMentionID(option)
                          }}
                          onMouseEnter={() => {
                            setHighlightedIndex(i)
                          }}
                          key={option.key}
                          option={option}
                        />
                      ))
                    : null}
                </ul>
              </div>,
              anchorElementRef.current
            )
          : null
      }
    />
  )
}
