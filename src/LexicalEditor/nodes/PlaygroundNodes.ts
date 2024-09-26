/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { type Klass, type LexicalNode } from 'lexical'

import { CodeHighlightNode, CodeNode } from '../nodes/CodeNode/index'
import { HashtagNode } from '@lexical/hashtag'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { MarkNode } from '@lexical/mark'
import { OverflowNode } from '@lexical/overflow'
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { CollapsibleContainerNode } from '../plugins/CollapsiblePlugin/CollapsibleContainerNode'
import { CollapsibleContentNode } from '../plugins/CollapsiblePlugin/CollapsibleContentNode'
import { CollapsibleTitleNode } from '../plugins/CollapsiblePlugin/CollapsibleTitleNode'
import { AutocompleteNode } from './AutocompleteNode'
import { EmojiNode } from './EmojiNode'
import { ImageNode } from './ImageNode'
import { KeywordNode } from './KeywordNode'
import { LayoutContainerNode } from './LayoutContainerNode'
import { LayoutItemNode } from './LayoutItemNode'
import { MentionNode } from './MentionNode'
import { PageBreakNode } from './PageBreakNode/index'
import { YouTubeNode } from './YouTubeNode'
import { ExtendedTextNode } from '../plugins/ExtentedTextNodePlugin/ExtendetextNodePugin'
import { ListNode, ListItemNode } from '@lexical/list'
import { TableNode, TableCellNode, TableRowNode } from './TableNode/index'
import { VideoNode } from './VideoNode'
import { SignatureNode } from './EmailSignatureNode'
const PlaygroundNodes: Array<Klass<LexicalNode>> = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  HashtagNode,
  CodeHighlightNode,
  AutoLinkNode,
  LinkNode,
  OverflowNode,
  ImageNode,
  MentionNode,
  EmojiNode,
  AutocompleteNode,
  KeywordNode,
  HorizontalRuleNode,
  YouTubeNode,
  MarkNode,
  CollapsibleContainerNode,
  CollapsibleContentNode,
  CollapsibleTitleNode,
  PageBreakNode,
  LayoutContainerNode,
  LayoutItemNode,
  ExtendedTextNode,
  VideoNode,
  SignatureNode,
]

export default PlaygroundNodes
