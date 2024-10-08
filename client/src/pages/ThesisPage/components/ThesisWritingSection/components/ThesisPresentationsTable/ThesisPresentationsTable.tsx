import React, { useState } from 'react'
import {
  useLoadedThesisContext,
  useThesisUpdateAction,
} from '../../../../../../providers/ThesisProvider/hooks'
import { Button, Center, Group, Stack, Tooltip } from '@mantine/core'
import { Check, Pencil, Trash } from 'phosphor-react'
import { doRequest } from '../../../../../../requests/request'
import { IThesis, IThesisPresentation } from '../../../../../../requests/responses/thesis'
import { ApiError } from '../../../../../../requests/handler'
import PresentationsTable from '../../../../../../components/PresentationsTable/PresentationsTable'
import ReplacePresentationModal from '../ReplacePresentationModal/ReplacePresentationModal'

const ThesisPresentationsTable = () => {
  const { access, thesis } = useLoadedThesisContext()

  const [openedPresentation, setOpenedPresentation] = useState<IThesisPresentation>()

  const [deleting, deletePresentation] = useThesisUpdateAction(
    async (presentation: IThesisPresentation) => {
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
        throw new ApiError(response)
      }
    },
    'Presentation deleted successfully',
  )

  const [scheduling, schedulePresentation] = useThesisUpdateAction(
    async (presentation: IThesisPresentation) => {
      const response = await doRequest<IThesis>(
        `/v2/theses/${thesis.thesisId}/presentations/${presentation.presentationId}/schedule`,
        {
          method: 'POST',
          requiresAuth: true,
        },
      )

      if (response.ok) {
        return response.data
      } else {
        throw new ApiError(response)
      }
    },
    'Presentation scheduled successfully',
  )

  const loading = deleting || scheduling

  return (
    <Stack>
      <ReplacePresentationModal
        presentation={openedPresentation}
        opened={!!openedPresentation}
        onClose={() => setOpenedPresentation(undefined)}
      />
      <PresentationsTable
        presentations={thesis.presentations}
        columns={['state', 'type', 'location', 'streamUrl', 'language', 'scheduledAt', 'actions']}
        extraColumns={{
          actions: {
            accessor: 'presentationId',
            title: 'Actions',
            textAlign: 'center',
            width: 180,
            ellipsis: true,
            render: (presentation) => (
              <Center>
                {access.student && (
                  <Group gap='xs'>
                    {presentation.state === 'DRAFTED' && access.advisor && (
                      <Tooltip
                        label={`Schedule Presentation${
                          presentation.visibility === 'PUBLIC'
                            ? ' (This will send out emails to all students that are currently writing a thesis)'
                            : ''
                        }`}
                      >
                        <Button
                          loading={loading}
                          size='xs'
                          onClick={() => schedulePresentation(presentation)}
                        >
                          <Check />
                        </Button>
                      </Tooltip>
                    )}
                    {(presentation.state === 'DRAFTED' || access.advisor) && (
                      <Tooltip label='Edit Presentation'>
                        <Button
                          loading={loading}
                          size='xs'
                          onClick={() => setOpenedPresentation(presentation)}
                        >
                          <Pencil />
                        </Button>
                      </Tooltip>
                    )}
                    {(presentation.state === 'DRAFTED' || access.advisor) && (
                      <Tooltip label='Delete Presentation'>
                        <Button
                          loading={loading}
                          size='xs'
                          onClick={() => deletePresentation(presentation)}
                        >
                          <Trash />
                        </Button>
                      </Tooltip>
                    )}
                  </Group>
                )}
              </Center>
            ),
          },
        }}
      />
    </Stack>
  )
}

export default ThesisPresentationsTable
