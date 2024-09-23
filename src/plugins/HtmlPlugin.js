import { Button, Input, message, Modal } from "antd";
import React, { useEffect, useState } from "react";
import {
  $insertNodes,
  $setSelection,
  CLEAR_EDITOR_COMMAND,
  COMMAND_PRIORITY_EDITOR,
  createCommand
} from "lexical";
import { mergeRegister } from "@lexical/utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateNodesFromDOM } from "@lexical/html";
import prettier from "prettier/standalone";
import parserHtml from "prettier/parser-html";
const { TextArea } = Input;
export const INSERT_HTML_COMMAND = createCommand("INSERT_HTML_COMMAND");

export function InsertHTMLDialog({
  handleHTMLModal,
  setHandleHTMLModal,
  activeEditor,
  htmlContent
}) {
  const [editorData, setEditorData] = useState("");
  useEffect(() => {
    setTimeout(() => {
      setEditorData(updatedHtml(htmlContent));
    }, 0);
  }, []);

  const onClick = () => {
    try {
      activeEditor.dispatchCommand(INSERT_HTML_COMMAND, {
        htmlContent: editorData
      });
      message.success("Content updated Successfully");
      setHandleHTMLModal(false);
    } catch (error) {
      console.log(error);
      setHandleHTMLModal(false);
    }
  };

  const handleTextAreaChange = (e) => {
    const newValue = e.target.value;
    setEditorData(newValue);
  };

  const updatedHtml = (htmlString) => {
    try {
      const formattedHtml = prettier.format(htmlString, {
        parser: "html",
        plugins: [parserHtml],
        htmlWhitespaceSensitivity: "css"
      });
      return formattedHtml;
    } catch (error) {
      console.error("Error formatting HTML:", error);
      message.error("Error on Formatting", 2.5);
      return htmlString;
    }
  };

  return (
    <>
      <Modal
        open={handleHTMLModal}
        title="HTML View"
        centered
        onCancel={() => {
          setHandleHTMLModal(false);
        }}
        footer={[
          <div key={"Buttons"}>
            {" "}
            <Button
              key={"Cancel"}
              onClick={() => {
                setHandleHTMLModal(false);
              }}
            >
              {" "}
              Cancel{" "}
            </Button>{" "}
            <Button
              key={"Confirm"}
              data-test-id="html-renderer"
              type="primary"
              onClick={onClick}
            >
              Confirm
            </Button>
          </div>
        ]}
      >
        {" "}
        <TextArea
          rows={15}
          value={editorData}
          onChange={handleTextAreaChange}
        />
      </Modal>
    </>
  );
}

const HtmlPlugin = () => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        INSERT_HTML_COMMAND,
        (payload) => {
          const { htmlContent } = payload || {};
          editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
          editor.update(
            () => {
              const parser = new DOMParser();
              const dom = parser.parseFromString(
                htmlContent || "",
                "text/html"
              );
              const nodes = $generateNodesFromDOM(editor, dom);
              $insertNodes(nodes);
              $setSelection(null);
            },
            { discrete: true }
          );
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      )
    );
  }, [editor]);

  return null;
};

export default HtmlPlugin;
