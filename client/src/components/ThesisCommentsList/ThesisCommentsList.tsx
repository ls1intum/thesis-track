import { useThesisCommentsContext } from '../../contexts/ThesisCommentsProvider/hooks'
import { Button, Center, Group, Pagination, Paper, Skeleton, Stack, Text } from '@mantine/core'
import { IThesisComment } from '../../requests/responses/thesis'
import { useLoggedInUser } from '../../hooks/authentication'
import { formatDate, formatUser } from '../../utils/format'
import { Download } from 'phosphor-react'
import { useHighlightedBackgroundColor } from '../../hooks/theme'
import { downloadFile } from '../../utils/blob'
import { doRequest } from '../../requests/request'
import { showSimpleError } from '../../utils/notification'
import { getApiResponseErrorMessage } from '../../requests/handler'

const ThesisCommentsList = () => {
  const { thesis, comments, deleteComment, limit, page, setPage } = useThesisCommentsContext()

  const user = useLoggedInUser()

  const commentBackgroundColor = useHighlightedBackgroundColor(false)

  const downloadCommentFile = async (comment: IThesisComment) => {
    if (!comment.filename) {
      return
    }

    const response = await doRequest<Blob>(
      `/v2/theses/${thesis.thesisId}/comments/${comment.commentId}/file`,
      {
        method: 'GET',
        requiresAuth: true,
        responseType: 'blob',
      },
    )

    if (response.ok) {
      downloadFile(new File([response.data], comment.filename))
    } else {
      showSimpleError(getApiResponseErrorMessage(response))
    }
  }

  return (
    <Stack>
      {!comments &&
        Array.from(Array(limit).keys()).map((index) => <Skeleton key={index} height={50} />)}
      {comments && comments.content.length === 0 && <Text ta='center'>No comments added yet</Text>}
      {comments &&
        comments.content.map((comment) => (
          <Stack gap={0} key={comment.commentId}>
            <Paper p='md' radius='sm' style={{ backgroundColor: commentBackgroundColor }}>
              <Group style={{ width: '100%' }}>
                <Text>{comment.message}</Text>
                {comment.filename && (
                  <Button onClick={() => downloadCommentFile(comment)} ml='auto'>
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
                {formatUser(comment.createdBy, { withUniversityId: true })}
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
