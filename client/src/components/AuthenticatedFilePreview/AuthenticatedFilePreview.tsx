import { useMemo, useState } from 'react'
import { Button, Center, Group, Stack, Text } from '@mantine/core'
import { downloadFile } from '../../utils/blob'
import { useApiFile } from '../../hooks/fetcher'
import { Link } from 'react-router-dom'
import { GLOBAL_CONFIG } from '../../config/global'

interface IAuthenticatedIframeProps {
  url: string
  filename: string
  title?: string
  height?: number
  allowDownload?: boolean
  includeLink?: boolean
}

const AuthenticatedFilePreview = (props: IAuthenticatedIframeProps) => {
  const { url, filename, allowDownload = true, includeLink = false, title, height } = props

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
        <Center>
          <Group mt='md'>
            <Button variant='outline' onClick={() => file && downloadFile(file)}>
              Download
            </Button>
            {includeLink && (
              <Button
                component={Link}
                to={`${GLOBAL_CONFIG.server_host}/api${url}`}
                variant='outline'
                target='_blank'
              >
                View File
              </Button>
            )}
          </Group>
        </Center>
      )}
    </Stack>
  )
}

export default AuthenticatedFilePreview
