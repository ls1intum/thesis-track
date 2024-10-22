import { ReactNode, useEffect, useState } from 'react'
import { Button, Center, Group, Stack } from '@mantine/core'
import { downloadFile } from '../../utils/blob'
import { BoxProps } from '@mantine/core/lib/core'
import FilePreview from '../FilePreview/FilePreview'
import { doRequest } from '../../requests/request'
import { showSimpleError } from '../../utils/notification'
import { getApiResponseErrorMessage } from '../../requests/handler'
import { UploadFileType } from '../../config/types'

interface IAuthenticatedFilePreviewProps extends BoxProps {
  url: string
  filename: string
  type: UploadFileType
  actionButton?: ReactNode
  aspectRatio?: number
  allowDownload?: boolean
}

const AuthenticatedFilePreview = (props: IAuthenticatedFilePreviewProps) => {
  const { url, filename, type, actionButton, aspectRatio = 16 / 9, allowDownload = true } = props

  const [file, setFile] = useState<File>()

  useEffect(() => {
    setFile(undefined)

    if (url) {
      return doRequest<Blob>(
        url,
        {
          method: 'GET',
          requiresAuth: true,
          responseType: 'blob',
        },
        (response) => {
          if (response.ok) {
            const mimeType: Record<UploadFileType, string> = {
              pdf: 'application/pdf',
              image: 'image/png',
              any: 'application/octet-stream',
            }

            setFile(new File([response.data], filename, { type: mimeType[type] }))
          } else {
            showSimpleError(getApiResponseErrorMessage(response))
          }
        },
      )
    }
  }, [url, filename, type])

  return (
    <Stack>
      {file && <FilePreview aspectRatio={aspectRatio} file={file} type={type} />}
      {(allowDownload || actionButton) && (
        <Center>
          <Group>
            {actionButton}
            {allowDownload && (
              <Button variant='outline' onClick={() => file && downloadFile(file)}>
                Download
              </Button>
            )}
          </Group>
        </Center>
      )}
    </Stack>
  )
}

export default AuthenticatedFilePreview
