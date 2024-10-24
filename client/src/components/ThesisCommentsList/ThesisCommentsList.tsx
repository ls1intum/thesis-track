import { useThesisCommentsContext } from '../../providers/ThesisCommentsProvider/hooks'
import { Center, Group, Pagination, Paper, Skeleton, Stack, Text } from '@mantine/core'
import { useLoggedInUser } from '../../hooks/authentication'
import { formatDate, formatUser } from '../../utils/format'
import { Download, Eye } from 'phosphor-react'
import { useHighlightedBackgroundColor } from '../../hooks/theme'
import AuthenticatedFileDownloadButton from '../AuthenticatedFileDownloadButton/AuthenticatedFileDownloadButton'
import AuthenticatedFilePreviewButton from '../AuthenticatedFilePreviewButton/AuthenticatedFilePreviewButton'

const ThesisCommentsList = () => {
  const { thesis, comments, deleteComment, limit, page, setPage } = useThesisCommentsContext()

  const user = useLoggedInUser()

  const commentBackgroundColor = useHighlightedBackgroundColor(false)

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
                {comment.uploadName && (
                  <Group gap='xs' ml='auto'>
                    <AuthenticatedFilePreviewButton
                      url={`/v2/theses/${thesis.thesisId}/comments/${comment.commentId}/file`}
                      filename={comment.uploadName}
                      type='any'
                      size='xs'
                    >
                      <Eye />
                    </AuthenticatedFilePreviewButton>
                    <AuthenticatedFileDownloadButton
                      url={`/v2/theses/${thesis.thesisId}/comments/${comment.commentId}/file`}
                      filename={comment.uploadName}
                      size='xs'
                    >
                      <Download />
                    </AuthenticatedFileDownloadButton>
                  </Group>
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
