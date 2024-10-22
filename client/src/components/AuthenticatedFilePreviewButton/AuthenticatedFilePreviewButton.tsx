import { ButtonProps } from '@mantine/core/lib/components/Button/Button'
import { Button, Modal } from '@mantine/core'
import { PropsWithChildren, useState } from 'react'
import AuthenticatedFilePreview from '../AuthenticatedFilePreview/AuthenticatedFilePreview'
import { UploadFileType } from '../../config/types'

interface IAuthenticatedFilePreviewButtonProps extends ButtonProps {
  url: string
  filename: string
  type: UploadFileType
  aspectRatio?: number
  allowDownload?: boolean
}

const AuthenticatedFilePreviewButton = (
  props: PropsWithChildren<IAuthenticatedFilePreviewButtonProps>,
) => {
  const {
    url,
    filename,
    type,
    aspectRatio = 16 / 9,
    allowDownload,
    children,
    ...buttonProps
  } = props

  const [modal, setModal] = useState(false)

  return (
    <Button onClick={() => setModal(true)} {...buttonProps}>
      <Modal
        size='xl'
        title={filename}
        opened={modal}
        onClose={() => setModal(false)}
        onClick={(e) => e.stopPropagation()}
      >
        <AuthenticatedFilePreview
          url={url}
          filename={filename}
          type={type}
          allowDownload={allowDownload}
          aspectRatio={aspectRatio}
        />
      </Modal>
      {children}
    </Button>
  )
}

export default AuthenticatedFilePreviewButton
