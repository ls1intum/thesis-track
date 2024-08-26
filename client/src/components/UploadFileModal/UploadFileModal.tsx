import { Button, Modal, Stack } from '@mantine/core'
import UploadArea from '../UploadArea/UploadArea'
import { useState, useEffect } from 'react'

interface IUploadFileModalProps {
  title: string
  opened: boolean
  onClose: () => unknown
  onUpload: (file: File) => unknown
  maxSize: number
}

const UploadFileModal = (props: IUploadFileModalProps) => {
  const { title, opened, onClose, onUpload, maxSize } = props

  const [submitting, setSubmitting] = useState(false)

  const [file, setFile] = useState<File>()

  useEffect(() => {
    setFile(undefined)
  }, [opened])

  return (
    <Modal opened={opened} onClose={onClose} title={title}>
      <Stack>
        <UploadArea value={file} onChange={setFile} maxSize={maxSize} />
        <Button
          fullWidth
          onClick={async () => {
            if (!file) {
              return
            }

            setSubmitting(true)

            try {
              await onUpload(file)
            } finally {
              onClose()
              setSubmitting(false)
            }
          }}
          loading={submitting}
          disabled={!file}
        >
          Save File
        </Button>
      </Stack>
    </Modal>
  )
}

export default UploadFileModal
