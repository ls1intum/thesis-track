import { useEffect, useMemo, useState } from 'react'
import { doRequest } from '../../requests/request'
import { Button, Space, Stack, Text } from '@mantine/core'
import { downloadPdf } from '../../utils/blob'
import { showSimpleError } from '../../utils/notification'
import { getApiResponseErrorMessage } from '../../requests/handler'

interface IAuthenticatedIframeProps {
  url: string
  filename: string
  title?: string
  height?: number
  allowDownload?: boolean
}

const AuthenticatedFilePreview = (props: IAuthenticatedIframeProps) => {
  const { url, filename, allowDownload = true, title, height } = props

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
        } else {
          showSimpleError(getApiResponseErrorMessage(res))
        }
      },
    )
  }, [url])

  const iframeUrl = useMemo(() => {
    return file ? `${URL.createObjectURL(file)}#toolbar=0&navpanes=0` : undefined
  }, [file])

  return (
    <Stack gap={0}>
      {title && <Text ta='center'>{title}</Text>}
      <iframe style={{ border: 0 }} height={height} src={iframeUrl} />
      {allowDownload && (
        <>
          <Space mb='md' />
          <Button variant='outline' mx='auto' onClick={() => file && downloadPdf(file, filename)}>
            Download
          </Button>
        </>
      )}
    </Stack>
  )
}

export default AuthenticatedFilePreview
