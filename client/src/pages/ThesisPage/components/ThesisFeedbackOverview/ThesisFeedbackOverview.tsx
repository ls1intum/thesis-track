import {
  useLoadedThesisContext,
  useThesisUpdateAction,
} from '../../../../providers/ThesisProvider/hooks'
import { Checkbox } from '@mantine/core'
import { IThesis } from '../../../../requests/responses/thesis'
import { DataTable } from 'mantine-datatable'
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
    <DataTable
      withTableBorder={false}
      borderRadius='sm'
      verticalSpacing='md'
      striped
      records={thesis.feedback.filter((item) => item.type === type)}
      idAccessor='feedbackId'
      columns={[
        {
          accessor: 'feedbackId',
          title: '',
          ellipsis: true,
          width: 50,
          textAlign: 'center',
          render: (item) => (
            <Checkbox
              checked={!!item.completedAt}
              disabled={loading || !access.student || !allowEdit}
              onChange={() => toggleFeedback(item)}
            />
          ),
        },
        {
          accessor: 'feedback',
          title: 'Requested Change',
        },
        {
          accessor: 'requestedBy',
          title: 'Requested By',
          ellipsis: true,
          width: 180,
          render: (item) => <AvatarUser user={item.requestedBy} />,
        },
        {
          accessor: 'requestedAt',
          title: 'Requested At',
          ellipsis: true,
          width: 150,
          render: (item) => formatDate(item.requestedAt),
        },
      ]}
    />
  )
}

export default ThesisFeedbackOverview
