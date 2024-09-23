import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $getNodeByKey,
  createCommand,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR
} from "lexical";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { PlusOutlined } from "@ant-design/icons";
import {
  $isParentElementRTL,
  $setBlocksType,
  $isAtNodeEnd,
  $patchStyleText,
  $getSelectionStyleValueForProperty
} from "@lexical/selection";

import { $createImageNode } from "../Nodes/ImageNode";
import {
  $getNearestNodeOfType,
  mergeRegister,
  $wrapNodeInElement
} from "@lexical/utils";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode
} from "@lexical/list";
import { createPortal } from "react-dom";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode
} from "@lexical/rich-text";
import {
  $createCodeNode,
  $isCodeNode,
  getDefaultCodeLanguage,
  getCodeLanguages
} from "@lexical/code";
import {
  Button,
  ColorPicker,
  Image,
  Input,
  message,
  Modal,
  Popover,
  Upload
} from "antd";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import _debounce from "lodash/debounce";
import axios from "axios";
import { VideoDialog } from "./VideoPlugin";
import { InsertHTMLDialog } from "./HtmlPlugin";

const LowPriority = 1;

const supportedBlockTypes = new Set([
  "paragraph",
  "quote",
  "code",
  "h1",
  "h2",
  "ul",
  "ol"
]);

export const INSERT_NEW_TABLE_COMMAND = createCommand(
  "INSERT_NEW_TABLE_COMMAND"
);

export const INSERT_IMAGE_COMMAND = createCommand("INSERT_IMAGE_COMMAND");

let apiUrl = "https://api.aroopaapps.com";
// let apiUrl = "http://localhost:8081";

const blockTypeToBlockName = {
  code: "Code Block",
  h1: "Large Heading",
  h2: "Small Heading",
  h3: "Heading",
  h4: "Heading",
  h5: "Heading",
  ol: "Numbered List",
  paragraph: "Normal",
  quote: "Quote",
  ul: "Bulleted List"
};

const ElementFormatType = {
  left: "Left-Align",
  right: "Right-Align",
  center: "Center-Align",
  justify: "Justify-Align"
};

function Divider() {
  return <div className="divider" />;
}

function positionEditorElement(editor, rect) {
  if (rect === null) {
    editor.style.opacity = "0";
    editor.style.top = "-1000px";
    editor.style.left = "-1000px";
  } else {
    editor.style.opacity = "1";
    editor.style.top = `${rect.top + rect.height + window.pageYOffset + 10}px`;
    editor.style.left = `${
      rect.left + window.pageXOffset - editor.offsetWidth / 2 + rect.width / 2
    }px`;
  }
}

function FloatingLinkEditor({ editor }) {
  const editorRef = useRef(null);
  const inputRef = useRef(null);
  const mouseDownRef = useRef(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isEditMode, setEditMode] = useState(false);
  const [lastSelection, setLastSelection] = useState(null);

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent)) {
        setLinkUrl(parent.getURL());
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL());
      } else {
        setLinkUrl("");
      }
    }
    const editorElem = editorRef.current;
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;

    if (editorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const domRange = nativeSelection.getRangeAt(0);
      let rect;
      if (nativeSelection.anchorNode === rootElement) {
        let inner = rootElement;
        while (inner.firstElementChild != null) {
          inner = inner.firstElementChild;
        }
        rect = inner.getBoundingClientRect();
      } else {
        rect = domRange.getBoundingClientRect();
      }

      if (!mouseDownRef.current) {
        positionEditorElement(editorElem, rect);
      }
      setLastSelection(selection);
    } else if (!activeElement || activeElement.className !== "link-input") {
      positionEditorElement(editorElem, null);
      setLastSelection(null);
      setEditMode(false);
      setLinkUrl("");
    }

    return true;
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLinkEditor();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateLinkEditor();
          return true;
        },
        LowPriority
      )
    );
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor();
    });
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditMode]);

  return (
    <div ref={editorRef} className="link-editor">
      {isEditMode ? (
        <input
          ref={inputRef}
          className="link-input"
          value={linkUrl}
          onChange={(event) => {
            setLinkUrl(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (lastSelection !== null) {
                if (linkUrl !== "") {
                  editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
                }
                setEditMode(false);
              }
            } else if (event.key === "Escape") {
              event.preventDefault();
              setEditMode(false);
            }
          }}
        />
      ) : (
        <>
          <div className="link-input">
            <a href={linkUrl} target="_blank" rel="noopener noreferrer">
              {linkUrl}
            </a>
            <div
              className="link-edit"
              role="button"
              tabIndex={0}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setEditMode(true);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

function Select({ onChange, className, options, value }) {
  return (
    <select className={className} onChange={onChange} value={value}>
      <option hidden={true} value="" />
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function getSelectedNode(selection) {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? focusNode : anchorNode;
  }
}

function BlockOptionsDropdownList({
  editor,
  blockType,
  toolbarRef,
  setShowBlockOptionsDropDown
}) {
  const dropDownRef = useRef(null);

  useEffect(() => {
    const toolbar = toolbarRef.current;
    const dropDown = dropDownRef.current;

    if (toolbar !== null && dropDown !== null) {
      const { top, left } = toolbar.getBoundingClientRect();
      dropDown.style.top = `${top + 40}px`;
      dropDown.style.left = `${left}px`;
    }
  }, [dropDownRef, toolbarRef]);

  useEffect(() => {
    const dropDown = dropDownRef.current;
    const toolbar = toolbarRef.current;

    if (dropDown !== null && toolbar !== null) {
      const handle = (event) => {
        const target = event.target;

        if (!dropDown.contains(target) && !toolbar.contains(target)) {
          setShowBlockOptionsDropDown(false);
        }
      };
      document.addEventListener("click", handle);

      return () => {
        document.removeEventListener("click", handle);
      };
    }
  }, [dropDownRef, setShowBlockOptionsDropDown, toolbarRef]);

  const formatParagraph = () => {
    if (blockType !== "paragraph") {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createParagraphNode());
        }
      });
    }
    setShowBlockOptionsDropDown(false);
  };

  const formatLargeHeading = () => {
    if (blockType !== "h1") {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode("h1"));
        }
      });
    }
    setShowBlockOptionsDropDown(false);
  };

  const formatSmallHeading = () => {
    if (blockType !== "h2") {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode("h2"));
        }
      });
    }
    setShowBlockOptionsDropDown(false);
  };

  const formatBulletList = () => {
    if (blockType !== "ul") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND);
    }
    setShowBlockOptionsDropDown(false);
  };

  const formatNumberedList = () => {
    if (blockType !== "ol") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND);
    }
    setShowBlockOptionsDropDown(false);
  };

  const formatQuote = () => {
    if (blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    }
    setShowBlockOptionsDropDown(false);
  };

  const formatCode = () => {
    if (blockType !== "code") {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createCodeNode());
        }
      });
    }
    setShowBlockOptionsDropDown(false);
  };

  return (
    <div className="dropdown" ref={dropDownRef}>
      <button className="item" onClick={formatParagraph}>
        <span className="icon paragraph" />
        <span className="text">Normal</span>
        {blockType === "paragraph" && <span className="active" />}
      </button>
      <button className="item" onClick={formatLargeHeading}>
        <span className="icon large-heading" />
        <span className="text">Large Heading</span>
        {blockType === "h1" && <span className="active" />}
      </button>
      <button className="item" onClick={formatSmallHeading}>
        <span className="icon small-heading" />
        <span className="text">Small Heading</span>
        {blockType === "h2" && <span className="active" />}
      </button>
      <button className="item" onClick={formatBulletList}>
        <span className="icon bullet-list" />
        <span className="text">Bullet List</span>
        {blockType === "ul" && <span className="active" />}
      </button>
      <button className="item" onClick={formatNumberedList}>
        <span className="icon numbered-list" />
        <span className="text">Numbered List</span>
        {blockType === "ol" && <span className="active" />}
      </button>
      <button className="item" onClick={formatQuote}>
        <span className="icon quote" />
        <span className="text">Quote</span>
        {blockType === "quote" && <span className="active" />}
      </button>
      <button className="item" onClick={formatCode}>
        <span className="icon code" />
        <span className="text">Code Block</span>
        {blockType === "code" && <span className="active" />}
      </button>
    </div>
  );
}

export default function ToolbarPlugin({ tenant, html }) {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [blockType, setBlockType] = useState("paragraph");
  const [selectedElementKey, setSelectedElementKey] = useState(null);
  const [showBlockOptionsDropDown, setShowBlockOptionsDropDown] =
    useState(false);

  const [codeLanguage, setCodeLanguage] = useState("");
  const [isRTL, setIsRTL] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [formatType, setFormatType] = useState("left");
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [textColor, setTextColor] = useState("");
  const [bgColor, setBgColor] = useState("");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [rows, setRows] = useState(5);
  const [columns, setColumns] = useState(5);
  const [isDisabled, setIsDisabled] = useState(true);
  const [handleTableModal, setHandleTableModal] = useState(false);
  const [handleImageModal, setHandleImageModal] = useState(false);
  const [handleMoreOptions, setHandleMoreOptions] = useState(false);
  const [imageInputMode, setImageInputMode] = useState("");
  const [handleVideoModal, setHandleVideoModal] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const [handleHTMLModal, setHandleHTMLModal] = useState(false);
  const [disabled, setDisabled] = useState(false);

  //image
  const [fileList, setFileList] = useState([]);
  const customRequest = _debounce(({ onProgress, file }) => {
    const data = {};
    data.containerName = "documents";
    const random = Math.random().toString().replace(/0\./, "");
    const date = new Date().toJSON().slice(0, 10);
    const blobName = `${random}-${date}`;
    data.blobNames = `temp/${blobName}-` + file.name;

    const url = `${apiUrl}/api/forms/presignedurl`;
    const headers = {
      "Content-Type": "application/json",
      "x-smc-tenant": tenant
    };

    axios
      .post(url, data, { headers })
      .then((res) => {
        if (res?.data) {
          const presignedUrl = res?.data.data[0]?.presignedUrl;
          const blobUrl = res?.data.data[0]?.blobUrl;

          if (presignedUrl) {
            axios
              .put(presignedUrl, file, {
                onUploadProgress: (progressEvent) => {
                  const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                  );
                  onProgress({ percent: percentCompleted }, file);
                },
                headers: {
                  "x-ms-blob-type": "BlockBlob",
                  "Content-Type": file.type
                }
              })
              .then((uploadRes) => {
                // setErr(file.status);

                if (uploadRes.status === 201) {
                  const newFile = {
                    uid: file?.uid,
                    name: file?.name,
                    url: blobUrl,
                    isDeleted: false
                  };
                  setFileList((prevItems) => [...prevItems, newFile]);
                  message.destroy();
                  message.success(`${file?.name} file uploaded successfully`);
                } else {
                  message.destroy();
                  message.error(`${file.name} file upload failed`);
                  file.status = "error";
                }
              });
          }
        }
      })
      .catch((error) => {
        message.destroy();
        console.error("Error uploading files", error);
        message.error(`${file.name} file upload failed`);
      });
  }, 1000);

  const handleFileUploadonChange = (info) => {
    if (info?.file?.status !== "uploading") {
      setFileList(info?.fileList);
    }
    if (info?.file?.status === "done") {
      message.success(`${info?.file?.name} file uploaded successfully`);
    } else if (info?.file?.status === "error") {
      message.error(`${info?.file?.name} file upload failed.`);
    } else if (info?.file?.status === "removed") {
      message.info(`${info?.file?.name} file removed successfully`);

      setFileList(info?.fileList);
    }
  };

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const insertImage = (payload) => {
    try {
      activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
      setDisabled(false);
    } catch (error) {
      console.error(error);
    }
  };

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);
      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getTag() : element.getTag();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          setBlockType(type);
          if ($isCodeNode(element)) {
            setCodeLanguage(element.getLanguage() || getDefaultCodeLanguage());
          }
        }
      }
      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));
      setIsRTL($isParentElementRTL(selection));

      setTextColor(
        $getSelectionStyleValueForProperty(selection, "color", "#000")
      );
      setBgColor(
        $getSelectionStyleValueForProperty(
          selection,
          "background-color",
          "#fff"
        )
      );

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
      setFontFamily(
        $getSelectionStyleValueForProperty(selection, "font-family", "Arial")
      );
    }
  }, [editor]);

  const applyStyleText = useCallback(
    (styles, skipHistoryStack) => {
      activeEditor.update(
        () => {
          const selection = $getSelection();
          if (selection !== null) {
            $patchStyleText(selection, styles);
          }
        },
        skipHistoryStack ? { tag: "historic" } : {}
      );
    },
    [activeEditor]
  );

  const onFontColorSelect = useCallback(
    (value, skipHistoryStack) => {
      applyStyleText({ color: value }, skipHistoryStack);
    },
    [applyStyleText]
  );

  const onBgColorSelect = useCallback(
    (value, skipHistoryStack) => {
      applyStyleText({ "background-color": value }, skipHistoryStack);
    },
    [applyStyleText]
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          setActiveEditor(newEditor);
          updateToolbar();
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        INSERT_IMAGE_COMMAND,
        (payload) => {
          if (payload?.length) {
            const { url } = payload?.[0];
            const imageNode = $createImageNode({
              src: url,
              altText: "Lexical Image",
              srcArray: [],
              showCaption: false
            });
            $insertNodes([imageNode]);
            if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
              $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
            }
            setHandleImageModal(false);
            setFileList([]);
            setImageInputMode("");
            return true;
          }
        },
        COMMAND_PRIORITY_EDITOR
      )
    );
  }, [editor, updateToolbar]);

  const codeLanguges = useMemo(() => getCodeLanguages(), []);
  const onCodeLanguageSelect = useCallback(
    (e) => {
      editor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(e.target.value);
          }
        }
      });
    },
    [editor, selectedElementKey]
  );

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const handleFormatType = ({ format }) => {
    try {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format);
      setFormatType(format);
    } catch (error) {
      console.error(error);
    }
  };

  const FONT_FAMILY_OPTIONS = [
    ["Arial", "Arial"],
    ["Courier New", "Courier New"],
    ["Georgia", "Georgia"],
    ["Times New Roman", "Times New Roman"],
    ["Trebuchet MS", "Trebuchet MS"],
    ["Verdana", "Verdana"]
  ];

  const handleFontFamily = useCallback(
    (option) => {
      console.log({ option });
      editor.update(() => {
        const selection = $getSelection();
        if (selection !== null) {
          $patchStyleText(selection, {
            "font-family": option
          });
        }
      });
    },
    [editor]
  );

  const [hover, setHover] = useState(false);

  const hoverStyle = {
    backgroundColor: hover ? "#388e3c" : "#66bb6a",
    marginTop: "10px"
  };

  //table
  useEffect(() => {
    const row = Number(rows);
    const column = Number(columns);
    if (row && row > 0 && row <= 500 && column && column > 0 && column <= 50) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [rows, columns]);

  return (
    <div className="toolbar" ref={toolbarRef}>
      <button
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND);
        }}
        className="toolbar-item spaced"
        aria-label="Undo"
      >
        <i className="format undo" />
      </button>
      <button
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND);
        }}
        className="toolbar-item"
        aria-label="Redo"
      >
        <i className="format redo" />
      </button>
      <Divider />
      {supportedBlockTypes.has(blockType) && (
        <>
          <button
            className="toolbar-item block-controls"
            onClick={() =>
              setShowBlockOptionsDropDown(!showBlockOptionsDropDown)
            }
            aria-label="Formatting Options"
          >
            <span className={"icon block-type " + blockType} />
            <span className="text">{blockTypeToBlockName[blockType]}</span>
            <i className="chevron-down" />
          </button>
          {showBlockOptionsDropDown &&
            createPortal(
              <BlockOptionsDropdownList
                editor={editor}
                blockType={blockType}
                toolbarRef={toolbarRef}
                setShowBlockOptionsDropDown={setShowBlockOptionsDropDown}
              />,
              document.body
            )}
          <Divider />
        </>
      )}
      {blockType === "code" ? (
        <>
          <Select
            className="toolbar-item code-language"
            onChange={onCodeLanguageSelect}
            options={codeLanguges}
            value={codeLanguage}
          />
          <i className="chevron-down inside" />
        </>
      ) : (
        <>
          <Popover
            placement="bottom"
            trigger="click"
            className="custom-popover-container"
            overlayInnerStyle={{
              boxShadow:
                "0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.5)",
              padding: "0px"
            }}
            content={
              <div className="custom-popover">
                {FONT_FAMILY_OPTIONS?.length ? (
                  FONT_FAMILY_OPTIONS?.map(([option, text]) => (
                    <button
                      className="item"
                      key={text}
                      aria-label={text}
                      onClick={() => {
                        handleFontFamily(option);
                      }}
                    >
                      <span className="text">{text}</span>
                    </button>
                  ))
                ) : (
                  <span>No Font family available</span>
                )}
              </div>
            }
          >
            <button
              className="toolbar-item block-controls"
              aria-label="Formatting Options"
            >
              <span className={`icon font-family`} />
              <span className="text">{fontFamily}</span>
              <i className="chevron-down" />
            </button>
          </Popover>
          <Divider />
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
            }}
            className={"toolbar-item spaced " + (isBold ? "active" : "")}
            aria-label="Format Bold"
          >
            <i className="format bold" />
          </button>
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
            }}
            className={"toolbar-item spaced " + (isItalic ? "active" : "")}
            aria-label="Format Italics"
          >
            <i className="format italic" />
          </button>
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
            }}
            className={"toolbar-item spaced " + (isUnderline ? "active" : "")}
            aria-label="Format Underline"
          >
            <i className="format underline" />
          </button>

          <button
            onClick={insertLink}
            className={"toolbar-item spaced " + (isLink ? "active" : "")}
            aria-label="Insert Link"
          >
            <i className="format link" />
          </button>

          <Popover
            placement="bottom"
            trigger="click"
            className="custom-popover-container"
            overlayInnerStyle={{
              boxShadow:
                "0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.5)",
              padding: "0px"
            }}
            content={
              <div
                style={{ display: "flex", flexDirection: "column" }}
                className="custom-popover"
              >
                <button
                  onClick={() => {
                    handleFormatType({
                      format: "left"
                    });
                  }}
                  className="item"
                  aria-label="Left Align"
                >
                  <i className="icon Left-Align" />
                  <span className="text">Left</span>
                </button>
                <button
                  onClick={() => {
                    handleFormatType({
                      format: "center"
                    });
                  }}
                  className="item"
                  aria-label="Center Align"
                >
                  <i className="icon Center-Align" />
                  <span className="text">Center</span>
                </button>
                <button
                  onClick={() => {
                    handleFormatType({
                      format: "right"
                    });
                  }}
                  className="item"
                  aria-label="Right Align"
                >
                  <i className="icon Right-Align" />
                  <span className="text">Right</span>
                </button>
                <button
                  onClick={() => {
                    handleFormatType({
                      format: "justify"
                    });
                  }}
                  className="item"
                  aria-label="Justify Align"
                >
                  <i className="icon Justify-Align" />
                  <span className="text">Justify</span>
                </button>{" "}
              </div>
            }
          >
            {" "}
            <button
              className="toolbar-item block-controls"
              aria-label="Formatting Options"
            >
              <span className={`icon ${ElementFormatType[formatType]}`} />
              <span className="text">{ElementFormatType[formatType]}</span>
              <i className="chevron-down" />
            </button>
          </Popover>
          <Popover
            placement="bottom"
            trigger="click"
            open={handleMoreOptions}
            className="custom-popover-container"
            overlayInnerStyle={{
              boxShadow:
                "0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.5)",
              padding: "0px"
            }}
            content={
              <div className="custom-popover" style={{ paddingBottom: "5px" }}>
                <button
                  onClick={() => {
                    editor.dispatchCommand(
                      FORMAT_TEXT_COMMAND,
                      "strikethrough"
                    );
                    setHandleMoreOptions(false);
                  }}
                  className={"item " + (isStrikethrough ? "active" : "")}
                  aria-label="Format Strikethrough"
                >
                  <i className="icon strikethrough" />
                  <span className="text"> Strike</span>
                </button>
                <button
                  onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
                    setHandleMoreOptions(false);
                  }}
                  className={"item " + (isCode ? "active" : "")}
                  aria-label="Insert Code"
                >
                  <i className="icon code" />
                  <span className="text">Code</span>
                </button>
                <button className="item">
                  <ColorPicker
                    value={textColor}
                    onChange={(color) => {
                      const hexColor = color.toHexString();
                      setTextColor(hexColor);
                    }}
                    showText={(color) => (
                      <span className="text">
                        Color ({color.toHexString()})
                      </span>
                    )}
                    panelRender={(panel) => (
                      <>
                        {panel}
                        {
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "end"
                            }}
                          >
                            {" "}
                            <Button
                              disabled={!textColor ? true : false}
                              size="small"
                              type="primary"
                              className="color-picker-apply-button"
                              style={hoverStyle}
                              onMouseEnter={() => setHover(true)}
                              onMouseLeave={() => setHover(false)}
                              onClick={() => {
                                onFontColorSelect(textColor);
                                setHandleMoreOptions(false);
                              }}
                            >
                              Apply
                            </Button>
                          </div>
                        }
                      </>
                    )}
                  />
                </button>
                <button className="item">
                  <ColorPicker
                    value={bgColor}
                    onChange={(color) => {
                      const hexColor = color.toHexString();
                      setBgColor(hexColor);
                    }}
                    showText={(color) => (
                      <span className="text">
                        Bg-Color ({color.toHexString()})
                      </span>
                    )}
                    panelRender={(panel) => (
                      <>
                        {panel}
                        {
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "end"
                            }}
                          >
                            {" "}
                            <Button
                              disabled={!bgColor ? true : false}
                              size="small"
                              type="primary"
                              className="color-picker-apply-button"
                              style={hoverStyle}
                              onMouseEnter={() => setHover(true)}
                              onMouseLeave={() => setHover(false)}
                              onClick={() => {
                                onBgColorSelect(bgColor);
                                setHandleMoreOptions(false);
                              }}
                            >
                              Apply
                            </Button>
                          </div>
                        }
                      </>
                    )}
                  />
                </button>

                <button
                  className="item"
                  onClick={() => {
                    setHandleMoreOptions(false);
                    setHandleImageModal(true);
                  }}
                >
                  <i className="icon bg-color" />
                  <span className="text">Image</span>
                </button>
                <button
                  className="item"
                  onClick={() => {
                    setHandleMoreOptions(false);
                    setHandleTableModal(true);
                  }}
                >
                  <i className="icon table" />
                  <span className="text">Table</span>
                </button>
                <button
                  className="item"
                  onClick={() => {
                    setHandleVideoModal(true);
                    setHandleMoreOptions(false);
                  }}
                >
                  <i className="icon bg-color" />
                  <span className="text">Video</span>
                </button>
              </div>
            }
          >
            <button
              className="toolbar-item block-controls"
              aria-label="Formatting Options"
              onClick={() => {
                setHandleMoreOptions((prev) => !prev);
              }}
            >
              <span className="icon plus-insert" />
              <span className="text">More</span>
              <i className="chevron-down" />
            </button>
          </Popover>
          <button
            title="HTML view"
            className={"toolbar-item"}
            onClick={() => {
              setHandleHTMLModal(true);
            }}
          >
            <i className="format html" />
          </button>
          <Modal
            title="Add Table"
            open={handleTableModal}
            centered
            onCancel={() => setHandleTableModal(false)}
            footer={[
              <div
                key={"table"}
                style={{ display: "flex", justifyContent: "end" }}
              >
                <Button
                  style={{ marginLeft: "5px" }}
                  key="back"
                  danger
                  onClick={() => {
                    setHandleTableModal(false);
                  }}
                >
                  Cancel
                </Button>
                ,
                <Button
                  key="submit"
                  disabled={isDisabled}
                  type="primary"
                  style={{ marginLeft: "5px" }}
                  onClick={async () => {
                    activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, {
                      columns,
                      rows
                    });
                    setHandleTableModal(false);
                  }}
                >
                  Submit
                </Button>
              </div>
            ]}
          >
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <tbody>
                <tr>
                  <td style={{ border: "none", padding: "8px" }}>
                    <label>Rows:</label>
                  </td>
                  <td style={{ border: "none", padding: "8px" }}>
                    <Input
                      value={rows}
                      onChange={(e) => setRows(e?.target?.value)}
                      placeholder="rows"
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "none", padding: "8px" }}>
                    <label>Columns:</label>
                  </td>
                  <td style={{ border: "none", padding: "8px" }}>
                    <Input
                      value={columns}
                      onChange={(e) => setColumns(e?.target?.value)}
                      placeholder="columns"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </Modal>

          <Modal
            open={handleImageModal}
            centered
            onCancel={() => {
              setHandleImageModal(false);
            }}
            title="Add Image"
            footer={
              imageInputMode && [
                <div key={"Buttons"}>
                  {" "}
                  <Button
                    key={"Cancel"}
                    onClick={() => {
                      setImageInputMode("");

                      setHandleImageModal(false);
                    }}
                  >
                    {" "}
                    Cancel{" "}
                  </Button>{" "}
                  <Button
                    type="primary"
                    key={"Confirm"}
                    disabled={
                      imageInputMode === "URL"
                        ? !imageSrc?.length
                        : !fileList?.length
                    }
                    onClick={() => {
                      if (imageInputMode === "URL") {
                        insertImage([{ url: imageSrc }]);
                      } else {
                        insertImage(fileList);
                      }
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              ]
            }
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "10px",
                gap: "20px"
              }}
            >
              {!imageInputMode && (
                <>
                  {" "}
                  <Button
                    key={"URL"}
                    onClick={() => {
                      setImageInputMode("URL");
                    }}
                  >
                    URL
                  </Button>{" "}
                  <Button
                    key={"File"}
                    onClick={() => {
                      setImageInputMode("File");
                    }}
                  >
                    File
                  </Button>
                </>
              )}
              {imageInputMode === "URL" && (
                <div>
                  <Input
                    placeholder="URL"
                    value={imageSrc}
                    onChange={(e) => {
                      setImageSrc(e.target.value);
                    }}
                    allowClear
                  />
                </div>
              )}
              {imageInputMode === "File" && (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Upload
                    disabled={disabled}
                    fileList={fileList}
                    beforeUpload={() => {
                      message.loading("Please wait to upload the Image...", 0);
                      setDisabled(true);
                    }}
                    listType="picture-card"
                    customRequest={customRequest}
                    onChange={handleFileUploadonChange}
                    onPreview={handlePreview}
                    accept="image/*"
                    multiple={false}
                  >
                    {fileList?.length >= 1 ? null : (
                      <button
                        style={{
                          border: 0,
                          background: "none"
                        }}
                        type="button"
                      >
                        <PlusOutlined />
                        <div
                          style={{
                            marginTop: 8
                          }}
                        >
                          Upload
                        </div>
                      </button>
                    )}
                  </Upload>
                  {previewImage && (
                    <Image
                      wrapperStyle={{ display: "none" }}
                      preview={{
                        visible: previewOpen,
                        onVisibleChange: (visible) => setPreviewOpen(visible),
                        afterOpenChange: (visible) =>
                          !visible && setPreviewImage("")
                      }}
                      src={previewImage}
                    />
                  )}
                </div>
              )}
            </div>
          </Modal>
          {handleVideoModal && (
            <VideoDialog
              handleVideoModal={handleVideoModal}
              setHandleVideoModal={setHandleVideoModal}
              tenant={tenant}
              activeEditor={activeEditor}
            />
          )}

          {handleHTMLModal && (
            <InsertHTMLDialog
              handleHTMLModal={handleHTMLModal}
              setHandleHTMLModal={setHandleHTMLModal}
              activeEditor={activeEditor}
              htmlContent={html}
            />
          )}
          {isLink &&
            createPortal(<FloatingLinkEditor editor={editor} />, document.body)}
        </>
      )}
    </div>
  );
}
