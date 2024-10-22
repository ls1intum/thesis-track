import { UploadFileType } from '../../config/types'
import { ButtonProps } from '@mantine/core/lib/components/Button/Button'
import { PropsWithChildren, useEffect, useState } from 'react'
import { Button, Modal, Stack } from '@mantine/core'
import UploadArea from '../UploadArea/UploadArea'

interface IUploadFileButtonProps extends ButtonProps {
  onUpload: (file: File) => unknown
  maxSize: number
  accept: UploadFileType
}

const UploadFileButton = (props: PropsWithChildren<IUploadFileButtonProps>) => {
  const { onUpload, maxSize, accept, children, ...buttonProps } = props

  const [file, setFile] = useState<File>()
  const [modal, setModal] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setFile(undefined)
    setLoading(false)
  }, [modal])

  return (
    <Button onClick={() => setModal(true)} {...buttonProps}>
      <Modal
        title='File Upload'
        opened={modal}
        onClose={() => setModal(false)}
        onClick={(e) => e.stopPropagation()}
      >
        <Stack>
          <UploadArea value={file} onChange={setFile} maxSize={maxSize} accept={accept} />
          <Button
            fullWidth
            disabled={!file}
            loading={loading}
            onClick={async () => {
              if (file) {
                setLoading(true)

                try {
                  await onUpload(file)

                  setModal(false)
                } finally {
                  setLoading(false)
                }
              }
            }}
          >
            Upload File
          </Button>
        </Stack>
      </Modal>
      {children}
    </Button>
  )
}

export default UploadFileButton
