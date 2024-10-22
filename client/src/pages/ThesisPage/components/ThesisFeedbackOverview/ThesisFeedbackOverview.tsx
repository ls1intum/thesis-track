import {
  useLoadedThesisContext,
  useThesisUpdateAction,
} from '../../../../providers/ThesisProvider/hooks'
import { Checkbox, Input, Table, Text } from '@mantine/core'
import { IThesis } from '../../../../requests/responses/thesis'
import React from 'react'
import AvatarUser from '../../../../components/AvatarUser/AvatarUser'
import { formatDate } from '../../../../utils/format'
import { doRequest } from '../../../../requests/request'
import { ApiError } from '../../../../requests/handler'

interface IThesisFeedbackOverviewProps {
  type: string
  allowEdit: boolean
}

const ThesisFeedbackOverview = (props: IThesisFeedbackOverviewProps) => {
  const { type, allowEdit } = props

  const { thesis, access } = useLoadedThesisContext()

  const [loading, toggleFeedback] = useThesisUpdateAction(
    async (feedback: IThesis['feedback'][number]) => {
      const response = await doRequest<IThesis>(
        `/v2/theses/${thesis.thesisId}/feedback/${feedback.feedbackId}/${feedback.completedAt ? 'request' : 'complete'}`,
        {
          method: 'PUT',
          requiresAuth: true,
        },
      )

      if (response.ok) {
        return response.data
      } else {
        throw new ApiError(response)
      }
    },
    'Feedback state successfully changed',
  )

  if (thesis.feedback.length === 0) {
    return null
  }

  return (
    <Input.Wrapper label='Feedback'>
      <Table.ScrollContainer minWidth={600}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th></Table.Th>
              <Table.Th>Requested Change</Table.Th>
              <Table.Th>Requested By</Table.Th>
              <Table.Th>Requested At</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {thesis.feedback
              .filter((item) => item.type === type)
              .map((item) => (
                <Table.Tr key={item.feedbackId}>
                  <Table.Td ta='center' width={50}>
                    <Checkbox
                      checked={!!item.completedAt}
                      disabled={loading || !access.student || !allowEdit}
                      onChange={() => toggleFeedback(item)}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Text>{item.feedback}</Text>
                  </Table.Td>
                  <Table.Td width={200}>
                    <AvatarUser user={item.requestedBy} />
                  </Table.Td>
                  <Table.Td width={170}>{formatDate(item.requestedAt)}</Table.Td>
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Input.Wrapper>
  )
}

export default ThesisFeedbackOverview
