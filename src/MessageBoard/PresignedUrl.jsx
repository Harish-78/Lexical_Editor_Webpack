import React from 'react'
import axios from 'axios'

const apiUrl = 'http://localhost:8083'

const PresignedUrl = async ({ name, file, type, filePath = '' }) => {
  try {
    const dataURItoBlob = (dataURI) => {
      const byteString = atob(dataURI?.split(',')[1])
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      return new Blob([ab])
    }
    if (name?.length && file && type) {
      let data = { blobNames: name }
      if (filePath) {
        data = {
          ...data,
          containerName: filePath || '',
        }
      }
      const pastedImageBlob = dataURItoBlob(file)
      const pastedImageFile = new File([pastedImageBlob], name?.[0], {
        type: type,
      })
      let url = `${apiUrl}/api/presignedUrl`
      const response = await axios.post(url, data).then((res) => {
        return res?.data?.data?.[0]
      })
      const presignedUrl = response?.presignedUrl
      const uploadPic = await axios
        .put(presignedUrl, pastedImageFile, {
          headers: {
            'Content-Type': type,
            'x-ms-blob-type': 'BlockBlob',
          },
        })
        .then((res) => {
          return res
        })
        .catch((err) => {
          console.error(err)
        })
      return response?.blobUrl
    }
  } catch (error) {
    console.error(error)
  }
}

export default PresignedUrl
