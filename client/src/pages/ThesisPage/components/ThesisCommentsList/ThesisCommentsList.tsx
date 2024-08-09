import { useThesisCommentsContext } from '../../../../contexts/ThesisCommentsProvider/hooks'
import { Button, Group, Modal, Stack, Text } from '@mantine/core'
import { IThesisComment } from '../../../../requests/responses/thesis'
import { useState } from 'react'
import AuthenticatedFilePreview from '../../../../components/AuthenticatedFilePreview/AuthenticatedFilePreview'
import { useLoggedInUser } from '../../../../hooks/authentication'

const ThesisCommentsList = () => {
  const { thesis, comments, deleteComment } = useThesisCommentsContext()

  const user = useLoggedInUser()

  const [openedComment, setOpenedComment] = useState<IThesisComment>()

  return (
    <Stack>
      <Modal opened={!!openedComment} onClose={() => setOpenedComment(undefined)} size='xl'>
        {openedComment && (
          <AuthenticatedFilePreview
            url={`/v2/theses/${thesis.thesisId}/comments/${openedComment.commentId}/file`}
            filename={`comment-${openedComment.commentId}`}
            height={400}
          />
        )}
      </Modal>
      {comments?.content.map((comment) => (
        <Group key={comment.commentId}>
          <Text>{comment.message}</Text>
          {(user.groups.includes('admin') || user.userId === comment.createdBy.userId) && (
            <Button onClick={() => deleteComment(comment)}>Delete</Button>
          )}
          {comment.hasFile && <Button onClick={() => setOpenedComment(comment)}>Open file</Button>}
        </Group>
      ))}
    </Stack>
  )
}

export default ThesisCommentsList
