import React from "react";
import axios from "axios";

const ImageCompress = async ({ base64String }) => {
  let tenant;
  const { host } = window.location;
  const parts = host.split(".");
  if (parts.length >= 3) tenant = parts[0];
  const formData = new FormData();
  formData.append("file", base64String);
  const value = await axios
    .post("https://image-resizer.smcommerce.net/image", formData, {
      headers: {
        "x-smc-tenant": tenant,
      },
    })
    .then((res) => {
      return res?.data?.[0]?.image;
    })
    .catch((error) => {
      console.error(error);
    });
  return value;
};

export default ImageCompress;
