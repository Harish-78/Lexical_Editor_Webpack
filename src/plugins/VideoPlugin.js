/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import { COMMAND_PRIORITY_EDITOR, createCommand } from "lexical";
import { useEffect, useState } from "react";
import { $createVideoNode, VideoNode } from "../Nodes/VideoNode";
import { Button, Input, message, Modal, Spin, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import _debounce from "lodash/debounce";
import axios from "axios";

export const INSERT_VIDEO_COMMAND = createCommand("INSERT_VIDEO_COMMAND");

let apiUrl = "https://api.aroopaapps.com";
// let apiUrl = "http://localhost:8081";

export const VideoDialog = ({
  handleVideoModal,
  setHandleVideoModal,
  tenant,
  activeEditor
}) => {
  const [fileList, setFileList] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const customRequest = _debounce(({ onProgress, file }) => {
    try {
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
                    setSpinning(false);
                    message.success(`${file?.name} file uploaded successfully`);
                  } else {
                    message.destroy();
                    setSpinning(false);
                    message.error(`${file.name} file upload failed`);
                    file.status = "error";
                  }
                });
            }
          }
        })
        .catch((error) => {
          message.destroy();
          setSpinning(false);
          console.error("Error uploading files", error);
          message.error(`${file.name} file upload failed`);
        });
    } catch (error) {
      message.destroy();
      console.error(error);
    }
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

  const handleOnConfirm = () => {
    setSpinning(true);
    try {
      if (fileList?.length) {
        const { url } = fileList?.[0];
        activeEditor.dispatchCommand(INSERT_VIDEO_COMMAND, url);
      }
      setSpinning(false);
      setHandleVideoModal(false);
    } catch (error) {
      console.error(error);
      setSpinning(false);
      setHandleVideoModal(false);
      message.error("Error on uploading the Video");
    }
  };

  return (
    <Modal
      title="Add Video"
      open={handleVideoModal}
      centered
      onCancel={() => {
        setHandleVideoModal(false);
      }}
      footer={[
        <div key={"Footer"}>
          {" "}
          <Button
            key={"Cancel"}
            onClick={() => {
              setHandleVideoModal(false);
            }}
          >
            {" "}
            Cancel{" "}
          </Button>{" "}
          <Button
            disabled={!fileList?.length}
            key={"Confirm"}
            onClick={handleOnConfirm}
            type="primary"
          >
            Confirm
          </Button>
        </div>
      ]}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "10px",
          gap: "20px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Upload
            fileList={fileList}
            beforeUpload={() => {
              setSpinning(true);
            }}
            customRequest={customRequest}
            onChange={handleFileUploadonChange}
            listType="picture-card"
            accept="video/*"
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
        </div>
      </div>
      <Spin spinning={spinning} fullscreen />
    </Modal>
  );
};

export function VideoPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    try {
      if (!editor.hasNodes([VideoNode])) {
        throw new Error("VideoPlugin: Video not registered on editor");
      }

      return editor.registerCommand(
        INSERT_VIDEO_COMMAND,
        (payload) => {
          const videoNode = $createVideoNode(payload);
          $insertNodeToNearestRoot(videoNode);

          return true;
        },
        COMMAND_PRIORITY_EDITOR
      );
    } catch (error) {
      console.error(error);
    }
  }, [editor]);

  return null;
}
