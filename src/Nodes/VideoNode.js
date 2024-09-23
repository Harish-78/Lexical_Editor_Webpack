/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { BlockWithAlignableContents } from "@lexical/react/LexicalBlockWithAlignableContents";
import { DecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
import * as React from "react";

function VideoComponent({ className, format, nodeKey, videoID }) {
  return (
    <BlockWithAlignableContents
      className={className}
      format={format}
      nodeKey={nodeKey}
    >
      <video width="560" className="lexical_video_plugin" height="315" controls>
        <source src={videoID} type="video/mp4" />
      </video>
    </BlockWithAlignableContents>
  );
}

function $convertVideoElement(domNode) {
  const videoID = domNode.getAttribute("data-lexical-Video");
  if (videoID) {
    const node = $createVideoNode(videoID);
    return { node };
  }
  return null;
}

export class VideoNode extends DecoratorBlockNode {
  __id;

  static getType() {
    return "Video";
  }

  static clone(node) {
    return new VideoNode(node.__id, node.__format, node.__key);
  }

  static importJSON(serializedNode) {
    const node = $createVideoNode(serializedNode.videoID);
    node.setFormat(serializedNode.format);
    return node;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: "Video",
      version: 1,
      videoID: this.__id
    };
  }

  constructor(id, format, key) {
    super(format, key);
    this.__id = id;
  }

  exportDOM() {
    const element = document.createElement("video");
    element.className = "lexical_video_plugin";
    element.setAttribute("data-lexical-Video", this.__id);
    element.setAttribute("width", "560");
    element.setAttribute("height", "315");
    element.setAttribute("controls", "true");
    const sourceMp4 = document.createElement("source");
    sourceMp4.setAttribute("src", this.__id);
    sourceMp4.setAttribute("type", "video/mp4");
    element.appendChild(sourceMp4);
    element.setAttribute("title", "Video playback");
    return { element };
  }

  static importDOM() {
    return {
      video: (domNode) => {
        if (!domNode.hasAttribute("data-lexical-Video")) {
          return null;
        }
        return {
          conversion: $convertVideoElement,
          priority: 1
        };
      }
    };
  }

  updateDOM() {
    return false;
  }

  getId() {
    return this.__id;
  }

  getTextContent(_includeInert, _includeDirectionless) {
    return `${this.__id}`;
  }

  decorate(_editor, config) {
    const embedBlockTheme = config.theme.embedBlock || {};
    const className = {
      base: embedBlockTheme.base || "",
      focus: embedBlockTheme.focus || ""
    };
    return (
      <VideoComponent
        className={className}
        format={this.__format}
        nodeKey={this.getKey()}
        videoID={this.__id}
      />
    );
  }
}

export function $createVideoNode(videoID) {
  return new VideoNode(videoID);
}

export function $isVideoNode(node) {
  return node instanceof VideoNode;
}
