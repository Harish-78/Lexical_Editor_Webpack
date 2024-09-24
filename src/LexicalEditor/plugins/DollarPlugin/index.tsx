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
import {
  $createTextNode,
  $getNodeByKey,
  $isRangeSelection,
  TextNode,
} from 'lexical'
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

const TRIGGERS = ['$'].join('')

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

function useMentionLookupService(
  mentionString: string | null,
  variables: Array
) {
  const [results, setResults] = useState<Array<string>>([])

  const fetchUsers = async (mentionString: string | null) => {
    try {
      if (mentionString === null || mentionString === '') {
        setResults([])
        return
      }
      await debouncedGetUsers(mentionString, setResults, variables)
    } catch (error) {
      console.error(error)
    }
  }
  useEffect(() => {
    fetchUsers(mentionString)
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

const debouncedGetUsers = debounce(
  async (searchTerm: string, renderList, variables) => {
    try {
      if (searchTerm && searchTerm.length >= 2) {
        const values = variables?.length
          ? variables.map((data: any) => ({ entityFields: data?.fullLabel }))
          : []

        if (values) {
          const filteredData = values.filter((value: any) => {
            return value?.entityFields
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
          })

          renderList(filteredData)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  },
  500
)

class MentionTypeaheadOption extends MenuOption {
  entity: string
  constructor(entity: string) {
    super(entity)
    this.entity = entity
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
      <span className="text">{option?.entity}</span>
    </li>
  )
}

export default function DollarPlugin({ variables }): JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  const [queryString, setQueryString] = useState(null)
  const results = useMentionLookupService(queryString, variables)
  const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
    minLength: 0,
  })

  const options = useMemo(
    () =>
      results.map((result) => {
        const resultsToShow = (
          <div style={{ paddingLeft: '10px' }}>{result?.entityFields}</div>
        )
        return new MentionTypeaheadOption(resultsToShow)
      }),
    [results]
  )
  const onSelectOption = useCallback(
    (
      selectedOption: MentionTypeaheadOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void
    ) => {
      editor.update(() => {
        const dollarNode = $createTextNode(
          `{{${selectedOption?.entity?.props?.children}}}`
        )
        if (nodeToReplace) {
          nodeToReplace?.replace(dollarNode)
          const textNode = $createTextNode(' ')
          dollarNode.insertAfter(textNode)
          textNode.select()
        }
        closeMenu()
      })
    },
    [editor]
  )

  const checkForDollarMatch = useCallback(
    (text: string) => {
      const slashMatch = checkForSlashTriggerMatch(text, editor)
      if (slashMatch !== null) {
        return null
      }
      return getPossibleQueryMatch(text)
    },
    [checkForSlashTriggerMatch, editor]
  )

  return (
    <LexicalTypeaheadMenuPlugin<MentionTypeaheadOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForDollarMatch}
      options={options}
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
