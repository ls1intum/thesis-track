import { useAutoAnimate } from '@formkit/auto-animate/react'
import React from 'react'
import { DataTable } from 'mantine-datatable'
import {
  useLoadedThesisContext,
  useThesisUpdateAction,
} from '../../../../../../contexts/ThesisProvider/hooks'
import { formatDate } from '../../../../../../utils/format'
import { Button, Group } from '@mantine/core'
import { Trash } from 'phosphor-react'
import { doRequest } from '../../../../../../requests/request'
import { IThesis } from '../../../../../../requests/responses/thesis'

const PresentationsTable = () => {
  const [bodyRef] = useAutoAnimate<HTMLTableSectionElement>()

  const { thesis } = useLoadedThesisContext()

  const [deleting, deletePresentation] = useThesisUpdateAction(
    async (presentation: IThesis['presentations'][number]) => {
      const response = await doRequest<IThesis>(
        `/v2/theses/${thesis.thesisId}/presentations/${presentation.presentationId}`,
        {
          method: 'DELETE',
          requiresAuth: true,
        },
      )

      if (response.ok) {
        return response.data
      } else {
        throw new Error(`Failed to delete presentation: ${response.status}`)
      }
    },
    'Presentation deleted successfully',
  )

  return (
    <DataTable
      withTableBorder
      minHeight={200}
      noRecordsText='No presentations scheduled yet'
      borderRadius='sm'
      verticalSpacing='md'
      striped
      highlightOnHover
      bodyRef={bodyRef}
      records={thesis.presentations}
      idAccessor='presentationId'
      columns={[
        {
          accessor: 'type',
          title: 'Type',
          textAlign: 'center',
        },
        {
          accessor: 'location',
          title: 'Location',
        },
        {
          accessor: 'streamUrl',
          title: 'Stream URL',
          render: (presentation) => (
            <a
              href={presentation.streamUrl || undefined}
              target='_blank'
              rel='noopener noreferrer nofollow'
            >
              {presentation.streamUrl}
            </a>
          ),
        },
        {
          accessor: 'scheduledAt',
          title: 'Scheduled At',
          render: (presentation) => formatDate(presentation.scheduledAt),
        },
        {
          accessor: 'presentationId',
          title: 'Actions',
          render: (presentation) => (
            <Group>
              <Button loading={deleting} onClick={() => deletePresentation(presentation)}>
                <Trash />
              </Button>
            </Group>
          ),
        },
      ]}
    />
  )
}

export default PresentationsTable
