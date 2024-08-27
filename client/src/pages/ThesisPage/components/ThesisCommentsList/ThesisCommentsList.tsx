import { useThesisCommentsContext } from '../../../../contexts/ThesisCommentsProvider/hooks'
import {
  Button,
  Card,
  Center,
  Group,
  Modal,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core'
import { IThesisComment } from '../../../../requests/responses/thesis'
import { useState } from 'react'
import AuthenticatedFilePreview from '../../../../components/AuthenticatedFilePreview/AuthenticatedFilePreview'
import { useLoggedInUser } from '../../../../hooks/authentication'
import { formatDate, formatUser } from '../../../../utils/format'
import { Download } from 'phosphor-react'
import { useHighlightedBackgroundColor } from '../../../../hooks/theme'

const ThesisCommentsList = () => {
  const { thesis, comments, deleteComment, limit, page, setPage } = useThesisCommentsContext()

  const user = useLoggedInUser()

  const [openedComment, setOpenedComment] = useState<IThesisComment>()

  const commentBackgroundColor = useHighlightedBackgroundColor(false)

  return (
    <Stack>
      <Modal opened={!!openedComment} onClose={() => setOpenedComment(undefined)} size='xl'>
        {openedComment && (
          <AuthenticatedFilePreview
            url={`/v2/theses/${thesis.thesisId}/comments/${openedComment.commentId}/file`}
            filename={`comment-${openedComment.commentId}.pdf`}
            height={400}
          />
        )}
      </Modal>
      {!comments &&
        Array.from(Array(limit).keys()).map((index) => <Skeleton key={index} height={50} />)}
      {comments && comments.content.length === 0 && <Text ta='center'>No comments added yet</Text>}
      {comments &&
        comments.content.map((comment) => (
          <Stack gap={0} key={comment.commentId}>
            <Paper p='md' radius='sm' style={{ backgroundColor: commentBackgroundColor }}>
              <Group style={{ width: '100%' }}>
                <Text>{comment.message}</Text>
                {comment.hasFile && (
                  <Button onClick={() => setOpenedComment(comment)} ml='auto'>
                    <Download />
                  </Button>
                )}
              </Group>
            </Paper>
            <Group ml='auto'>
              <Text size='xs' c='dimmed'>
                {formatDate(comment.createdAt)}
              </Text>
              <Text size='xs' c='dimmed'>
                {formatUser(comment.createdBy)}
              </Text>
              {(user.groups.includes('admin') || user.userId === comment.createdBy.userId) && (
                <Text
                  component='a'
                  href='#'
                  size='xs'
                  c='dimmed'
                  style={{ textDecoration: 'underline' }}
                  onClick={(e) => {
                    e.preventDefault()
                    deleteComment(comment)
                  }}
                >
                  Delete
                </Text>
              )}
            </Group>
          </Stack>
        ))}
      {comments && comments.totalPages > 1 && (
        <Center>
          <Pagination
            value={page + 1}
            onChange={(x) => setPage(x - 1)}
            total={comments.totalPages}
            siblings={2}
          />
        </Center>
      )}
    </Stack>
  )
}

export default ThesisCommentsList
