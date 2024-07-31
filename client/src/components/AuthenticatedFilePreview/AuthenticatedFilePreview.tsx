import { IframeHTMLAttributes, useEffect, useMemo, useState } from 'react'
import { doRequest } from '../../requests/request'
import { Button, Center, Stack } from '@mantine/core'
import { downloadFile } from '../../utils/blob'

interface IAuthenticatedIframeProps {
  url: string,
  filename: string,
  height?: number
  allowDownload?: boolean
}

const AuthenticatedFilePreview = (props: IAuthenticatedIframeProps) => {
  const { url, filename, allowDownload = true, height } = props

  const [file, setFile] = useState<Blob>()

  useEffect(() => {
    setFile(undefined)

    return doRequest<Blob>(
      url,
      {
        method: 'GET',
        requiresAuth: true,
        responseType: 'blob',
      },
      (res) => {
        if (res.ok) {
          setFile(res.data)
        }
      },
    )
  }, [url])

  const iframeUrl = useMemo(() => {
    return file ? URL.createObjectURL(file) : undefined
  }, [file])

  return (
    <Stack>
      <iframe style={{ border: 0 }} height={height} src={iframeUrl} />
      {allowDownload && (
        <Button variant='outline' mx='auto' onClick={() => file && downloadFile(file, filename)}>Download</Button>
      )}
    </Stack>
  )
}

export default AuthenticatedFilePreview
