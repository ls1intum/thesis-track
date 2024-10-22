import { ButtonProps } from '@mantine/core/lib/components/Button/Button'
import { Button } from '@mantine/core'
import { PropsWithChildren, useState } from 'react'
import { doRequest } from '../../requests/request'
import { showSimpleError } from '../../utils/notification'
import { getApiResponseErrorMessage } from '../../requests/handler'
import { downloadFile } from '../../utils/blob'

interface IAuthenticatedFileDownloadButtonProps extends ButtonProps {
  url: string
  filename: string
}

const AuthenticatedFileDownloadButton = (
  props: PropsWithChildren<IAuthenticatedFileDownloadButtonProps>,
) => {
  const { url, filename, children, ...buttonProps } = props

  const [loading, setLoading] = useState(false)

  const onDownload = async () => {
    setLoading(true)

    try {
      const response = await doRequest<Blob>(url, {
        method: 'GET',
        requiresAuth: true,
        responseType: 'blob',
      })

      if (response.ok) {
        downloadFile(new File([response.data], filename, { type: 'application/octet-stream' }))
      } else {
        showSimpleError(getApiResponseErrorMessage(response))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={onDownload} loading={loading} {...buttonProps}>
      {children}
    </Button>
  )
}

export default AuthenticatedFileDownloadButton
