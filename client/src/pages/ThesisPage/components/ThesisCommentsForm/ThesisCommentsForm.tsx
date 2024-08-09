import { Button, Stack, Textarea } from '@mantine/core'
import { useState } from 'react'
import UploadFileModal from '../../../../components/UploadFileModal/UploadFileModal'
import { useThesisCommentsContext } from '../../../../contexts/ThesisCommentsProvider/hooks'
import { Upload } from 'phosphor-react'

const ThesisCommentsForm = () => {
  const { postComment, posting } = useThesisCommentsContext()

  const [message, setMessage] = useState('')
  const [file, setFile] = useState<File>()

  const [uploadModal, setUploadModal] = useState(false)

  return (
    <Stack>
      <UploadFileModal
        title='Attach File'
        opened={uploadModal}
        onClose={() => setUploadModal(false)}
        onUpload={setFile}
      />
      <Textarea
        placeholder='Add a comment'
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rightSection={
          <Button size='xs' onClick={() => setUploadModal(true)}>
            <Upload />
          </Button>
        }
        rightSectionWidth={70}
        minRows={5}
      />
      <Button
        ml='auto'
        disabled={!message}
        loading={posting}
        onClick={() => {
          postComment(message, file)

          setMessage('')
          setFile(undefined)
        }}
      >
        Post Comment
      </Button>
    </Stack>
  )
}

export default ThesisCommentsForm
