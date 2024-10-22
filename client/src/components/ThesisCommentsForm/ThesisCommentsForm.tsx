import { Button, Stack, Textarea } from '@mantine/core'
import { useState } from 'react'
import { useThesisCommentsContext } from '../../providers/ThesisCommentsProvider/hooks'
import { Upload } from 'phosphor-react'
import UploadFileButton from '../UploadFileButton/UploadFileButton'
import { isThesisClosed } from '../../utils/thesis'

const ThesisCommentsForm = () => {
  const { postComment, posting, thesis } = useThesisCommentsContext()

  const [message, setMessage] = useState('')
  const [file, setFile] = useState<File>()

  if (isThesisClosed(thesis)) {
    return null
  }

  return (
    <Stack>
      <Textarea
        label='Comment'
        placeholder='Add a comment'
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rightSection={
          <UploadFileButton onUpload={setFile} maxSize={20 * 1024 * 1024} accept='any' size='xs'>
            <Upload />
          </UploadFileButton>
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
