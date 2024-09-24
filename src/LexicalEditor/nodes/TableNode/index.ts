/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export type { SerializedTableCellNode } from './LexicalTableCellNode.ts'
export {
  $createTableCellNode,
  $isTableCellNode,
  TableCellHeaderStates,
  TableCellNode,
} from './LexicalTableCellNode.ts'
export type {
  InsertTableCommandPayload,
  InsertTableCommandPayloadHeaders,
} from './LexicalTableCommands.ts'
export { INSERT_TABLE_COMMAND } from './LexicalTableCommands.ts'
export type { SerializedTableNode } from './LexicalTableNode.ts'
export {
  $createTableNode,
  $getElementForTableNode,
  $isTableNode,
  TableNode,
} from './LexicalTableNode.ts'
export type { TableDOMCell } from './LexicalTableObserver.ts'
export { TableObserver } from './LexicalTableObserver.ts'
export type { SerializedTableRowNode } from './LexicalTableRowNode.ts'
export {
  $createTableRowNode,
  $isTableRowNode,
  TableRowNode,
} from './LexicalTableRowNode.ts'
export type {
  TableMapType,
  TableMapValueType,
  TableSelection,
  TableSelectionShape,
} from './LexicalTableSelection.ts'
export {
  $createTableSelection,
  $isTableSelection,
} from './LexicalTableSelection.ts'
export type { HTMLTableElementWithWithTableSelectionState } from './LexicalTableSelectionHelpers.ts'
export {
  $findCellNode,
  $findTableNode,
  applyTableHandlers,
  getDOMCellFromTarget,
  getTableObserverFromTableElement,
} from './LexicalTableSelectionHelpers.ts'
export {
  $computeTableMap,
  $computeTableMapSkipCellCheck,
  $createTableNodeWithDimensions,
  $deleteTableColumn,
  $deleteTableColumn__EXPERIMENTAL,
  $deleteTableRow__EXPERIMENTAL,
  $getNodeTriplet,
  $getTableCellNodeFromLexicalNode,
  $getTableCellNodeRect,
  $getTableColumnIndexFromTableCellNode,
  $getTableNodeFromLexicalNodeOrThrow,
  $getTableRowIndexFromTableCellNode,
  $getTableRowNodeFromTableCellNodeOrThrow,
  $insertTableColumn,
  $insertTableColumn__EXPERIMENTAL,
  $insertTableRow,
  $insertTableRow__EXPERIMENTAL,
  $removeTableRowAtIndex,
  $unmergeCell,
} from './LexicalTableUtils.ts'
