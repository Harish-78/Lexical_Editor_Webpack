/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { EditorThemeClasses } from 'lexical'

import './LandingPage.css'

const LandingPageEditorTheme: EditorThemeClasses = {
  blockCursor: 'blockCursor',

  heading: {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
  },
  indent: 'indent',
  link: 'link',
  list: {
    checklist: 'checklist',
    listitem: 'listItem',
    listitemChecked: 'listItemChecked',
    listitemUnchecked: 'listItemUnchecked',
    nested: {
      listitem: 'nestedListItem',
    },
    olDepth: ['ol1', 'ol2', 'ol3', 'ol4', 'ol5'],
    ul: 'ul',
  },
  ltr: 'ltr',
  paragraph: 'tw-lp-paragraph',
  rtl: 'rtl',
  text: {
    bold: 'textBold',
    italic: 'textItalic',
    underline: 'textUnderline',
  },
}

export default LandingPageEditorTheme
