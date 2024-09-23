import formRenderEditorTheme from "./themes/EditorTheme";
import * as React from "react";
import { useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import "./styles.css";
import { TablePlugin } from "./plugins/TablePlugin";
import TableCellResizerPlugin from "./plugins/TableCellResizer/TableCellResizer";
import TableHoverActionsPlugin from "./plugins/TableHoverActionsPlugin/TableHoverAction";
import TableActionMenuPlugin from "./plugins/TableActionMenuPlugin/TableActionMenu";
import { ImageNode } from "./Nodes/ImageNode";
import { VideoNode } from "./Nodes/VideoNode";
import { VideoPlugin } from "./plugins/VideoPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodes, $setSelection } from "lexical";
import HtmlPlugin from "./plugins/HtmlPlugin";

const HtmlRenderer = ({ value }) => {
  try {
    const [editor] = useLexicalComposerContext();

    React.useEffect(() => {
      try {
        if (value) {
          editor.update(
            () => {
              const parser = new DOMParser();
              const dom = parser.parseFromString(value, "text/html");
              const nodes = $generateNodesFromDOM(editor, dom);
              $insertNodes(nodes);
              $setSelection(null);
            },
            { discrete: true }
          );
        }
      } catch (error) {
        console.error(error);
      }
    }, [editor]);
    return null;
  } catch (error) {
    console.error(error);
  }
};

function Placeholder() {
  return <div className="editor-placeholder">Enter some text...</div>;
}

const editorConfig = {
  // The editor theme
  theme: formRenderEditorTheme,
  // Handling of errors during update
  onError(error) {
    throw error;
  },
  // Any custom nodes go here
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
    ImageNode,
    VideoNode
  ]
};

export default function Editor({ tenant, onChange, value }) {
  const [htmlContent, setHtmlContent] = useState("");

  const [floatingAnchorElem, setFloatingAnchorElem] = useState(null);
  const onRef = React.useCallback((_floatingAnchorElem) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  }, []);

  const handleOnChange = React.useCallback((editorState, editor) => {
    try {
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor);
        onChange(html);
        setHtmlContent(html);
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        <ToolbarPlugin tenant={tenant} html={htmlContent} />
        <hr
          style={{ margin: "0px", height: "1px", backgroundColor: "#f2f2f2" }}
        />
        <div className="editor-inner" ref={onRef}>
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <TablePlugin
            hasCellBackgroundColor={true}
            hasCellMerge={true}
            hasTabHandler={true}
          />
          <AutoFocusPlugin />
          <CodeHighlightPlugin />
          <TableCellResizerPlugin />
          <TableHoverActionsPlugin />
          <TableActionMenuPlugin />
          <ListPlugin />
          <OnChangePlugin onChange={handleOnChange} />
          {value && <HtmlRenderer value={value ?? ""} />} <LinkPlugin />
          <AutoLinkPlugin />
          <VideoPlugin />
          <ListMaxIndentLevelPlugin maxDepth={7} />
          <HtmlPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        </div>
      </div>
    </LexicalComposer>
  );
}
