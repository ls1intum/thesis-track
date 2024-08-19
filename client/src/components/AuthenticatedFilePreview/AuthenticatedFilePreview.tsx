import { useMemo, useState } from 'react'
import { Button, Space, Stack, Text } from '@mantine/core'
import { downloadFile } from '../../utils/blob'
import { useApiFile } from '../../hooks/fetcher'

interface IAuthenticatedIframeProps {
  url: string
  filename: string
  title?: string
  height?: number
  allowDownload?: boolean
}

const AuthenticatedFilePreview = (props: IAuthenticatedIframeProps) => {
  const { url, filename, allowDownload = true, title, height } = props

  const [file, setFile] = useState<File>()

  useApiFile(url, filename, setFile)

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
          <Button variant='outline' mx='auto' onClick={() => file && downloadFile(file)}>
            Download
          </Button>
        </>
      )}
    </Stack>
  )
}

export default AuthenticatedFilePreview
