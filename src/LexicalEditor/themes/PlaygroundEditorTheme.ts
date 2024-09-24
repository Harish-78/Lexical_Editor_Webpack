/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { EditorThemeClasses } from 'lexical'

import './PlaygroundEditorTheme.css'

const theme: EditorThemeClasses = {
  autocomplete: 'aroopa_editor__autocomplete',
  blockCursor: 'aroopa_editor__blockCursor',
  characterLimit: 'aroopa_editor__characterLimit',
  code: 'aroopa_editor__code',
  codeHighlight: {
    atrule: 'aroopa_editor__tokenAttr',
    attr: 'aroopa_editor__tokenAttr',
    boolean: 'aroopa_editor__tokenProperty',
    builtin: 'aroopa_editor__tokenSelector',
    cdata: 'aroopa_editor__tokenComment',
    char: 'aroopa_editor__tokenSelector',
    class: 'aroopa_editor__tokenFunction',
    'class-name': 'aroopa_editor__tokenFunction',
    comment: 'aroopa_editor__tokenComment',
    constant: 'aroopa_editor__tokenProperty',
    deleted: 'aroopa_editor__tokenProperty',
    doctype: 'aroopa_editor__tokenComment',
    entity: 'aroopa_editor__tokenOperator',
    function: 'aroopa_editor__tokenFunction',
    important: 'aroopa_editor__tokenVariable',
    inserted: 'aroopa_editor__tokenSelector',
    keyword: 'aroopa_editor__tokenAttr',
    namespace: 'aroopa_editor__tokenVariable',
    number: 'aroopa_editor__tokenProperty',
    operator: 'aroopa_editor__tokenOperator',
    prolog: 'aroopa_editor__tokenComment',
    property: 'aroopa_editor__tokenProperty',
    punctuation: 'aroopa_editor__tokenPunctuation',
    regex: 'aroopa_editor__tokenVariable',
    selector: 'aroopa_editor__tokenSelector',
    string: 'aroopa_editor__tokenSelector',
    symbol: 'aroopa_editor__tokenProperty',
    tag: 'aroopa_editor__tokenProperty',
    url: 'aroopa_editor__tokenOperator',
    variable: 'aroopa_editor__tokenVariable',
  },
  embedBlock: {
    base: 'aroopa_editor__embedBlock',
    focus: 'aroopa_editor__embedBlockFocus',
  },
  hashtag: 'aroopa_editor__hashtag',
  heading: {
    h1: 'aroopa_editor__h1',
    h2: 'aroopa_editor__h2',
    h3: 'aroopa_editor__h3',
    h4: 'aroopa_editor__h4',
    h5: 'aroopa_editor__h5',
    h6: 'aroopa_editor__h6',
  },
  hr: 'aroopa_editor__hr',
  image: 'editor-image',
  indent: 'aroopa_editor__indent',
  inlineImage: 'inline-editor-image',
  layoutContainer: 'aroopa_editor__layoutContainer',
  layoutItem: 'aroopa_editor__layoutItem',
  link: 'aroopa_editor__link',
  list: {
    checklist: 'aroopa_editor__checklist',
    listitem: 'aroopa_editor__listItem',
    listitemChecked: 'aroopa_editor__listItemChecked',
    listitemUnchecked: 'aroopa_editor__listItemUnchecked',
    nested: {
      listitem: 'aroopa_editor__nestedListItem',
    },
    olDepth: [
      'aroopa_editor__ol1',
      'aroopa_editor__ol2',
      'aroopa_editor__ol3',
      'aroopa_editor__ol4',
      'aroopa_editor__ol5',
    ],
    ul: 'aroopa_editor__ul',
  },
  ltr: 'aroopa_editor__ltr',
  mark: 'aroopa_editor__mark',
  markOverlap: 'aroopa_editor__markOverlap',
  paragraph: 'aroopa_editor__paragraph',
  quote: 'aroopa_editor__quote',
  rtl: 'aroopa_editor__rtl',
  table: 'aroopa_editor__table',
  tableAddColumns: 'aroopa_editor__tableAddColumns',
  tableAddRows: 'aroopa_editor__tableAddRows',
  tableCell: 'aroopa_editor__tableCell',
  tableCellActionButton: 'aroopa_editor__tableCellActionButton',
  tableCellActionButtonContainer:
    'aroopa_editor__tableCellActionButtonContainer',
  tableCellEditing: 'aroopa_editor__tableCellEditing',
  tableCellHeader: 'aroopa_editor__tableCellHeader',
  tableCellPrimarySelected: 'aroopa_editor__tableCellPrimarySelected',
  tableCellResizer: 'aroopa_editor__tableCellResizer',
  tableCellSelected: 'aroopa_editor__tableCellSelected',
  tableCellSortedIndicator: 'aroopa_editor__tableCellSortedIndicator',
  tableResizeRuler: 'aroopa_editor__tableCellResizeRuler',
  tableSelected: 'aroopa_editor__tableSelected',
  tableSelection: 'aroopa_editor__tableSelection',
  text: {
    bold: 'aroopa_editor__textBold',
    code: 'aroopa_editor__textCode',
    italic: 'aroopa_editor__textItalic',
    strikethrough: 'aroopa_editor__textStrikethrough',
    subscript: 'aroopa_editor__textSubscript',
    superscript: 'aroopa_editor__textSuperscript',
    underline: 'aroopa_editor__textUnderline',
    underlineStrikethrough: 'aroopa_editor__textUnderlineStrikethrough',
  },
}

export default theme
