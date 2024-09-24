/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { type Klass, type LexicalNode } from 'lexical'

import { CodeHighlightNode, CodeNode } from '../nodes/CodeNode/index.ts'
import { HashtagNode } from '@lexical/hashtag'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { MarkNode } from '@lexical/mark'
import { OverflowNode } from '@lexical/overflow'
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { CollapsibleContainerNode } from '../plugins/CollapsiblePlugin/CollapsibleContainerNode.ts'
import { CollapsibleContentNode } from '../plugins/CollapsiblePlugin/CollapsibleContentNode.ts'
import { CollapsibleTitleNode } from '../plugins/CollapsiblePlugin/CollapsibleTitleNode.ts'
import { AutocompleteNode } from './AutocompleteNode.tsx'
import { EmojiNode } from './EmojiNode.tsx'
import { EquationNode } from './EquationNode.tsx'
import { ImageNode } from './ImageNode.tsx'
import { KeywordNode } from './KeywordNode.ts'
import { LayoutContainerNode } from './LayoutContainerNode.ts'
import { LayoutItemNode } from './LayoutItemNode.ts'
import { MentionNode } from './MentionNode.ts'
import { PageBreakNode } from './PageBreakNode/index.tsx'
import { YouTubeNode } from './YouTubeNode.tsx'
import { ExtendedTextNode } from '../plugins/ExtentedTextNodePlugin/ExtendetextNodePugin.tsx'
import { ListNode, ListItemNode } from '@lexical/list'
import { TableNode, TableCellNode, TableRowNode } from './TableNode/index.ts'
import { VideoNode } from './VideoNode.tsx'
import { SignatureNode } from './EmailSignatureNode.ts'
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
  EquationNode,
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
