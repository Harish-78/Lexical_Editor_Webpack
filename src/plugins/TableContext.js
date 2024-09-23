/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createTableNodeWithDimensions, TableNode } from "@lexical/table";
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand } from "lexical";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as React from "react";

export const INSERT_NEW_TABLE_COMMAND = createCommand(
  "INSERT_NEW_TABLE_COMMAND"
);

export const CellContext = createContext({
  cellEditorConfig: null,
  cellEditorPlugins: null,
  set: () => {
    // Empty
  }
});

export function TableContext({ children }) {
  const [contextValue, setContextValue] = useState({
    cellEditorConfig: null,
    cellEditorPlugins: null
  });
  return (
    <CellContext.Provider
      value={useMemo(
        () => ({
          cellEditorConfig: contextValue.cellEditorConfig,
          cellEditorPlugins: contextValue.cellEditorPlugins,
          set: (cellEditorConfig, cellEditorPlugins) => {
            setContextValue({ cellEditorConfig, cellEditorPlugins });
          }
        }),
        [contextValue.cellEditorConfig, contextValue.cellEditorPlugins]
      )}
    >
      {children}
    </CellContext.Provider>
  );
}

export function TablePlugin({ cellEditorConfig, children }) {
  const [editor] = useLexicalComposerContext();
  const cellContext = useContext(CellContext);

  useEffect(() => {
    try {
      if (!editor.hasNodes([TableNode])) {
        console.error("TablePlugin: TableNode is not registered on editor");
      }

      cellContext.set(cellEditorConfig, children);

      return editor.registerCommand(
        INSERT_NEW_TABLE_COMMAND,
        ({ columns, rows, includeHeaders }) => {
          const tableNode = $createTableNodeWithDimensions(
            Number(rows),
            Number(columns),
            includeHeaders
          );
          $insertNodes([tableNode]);
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      );
    } catch (error) {
      console.error(error);
    }
  }, [cellContext, cellEditorConfig, children, editor]);

  return null;
}
