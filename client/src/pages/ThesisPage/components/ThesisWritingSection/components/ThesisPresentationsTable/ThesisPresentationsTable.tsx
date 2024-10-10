import React, { useState } from 'react'
import {
  useLoadedThesisContext,
  useThesisUpdateAction,
} from '../../../../../../providers/ThesisProvider/hooks'
import { Button, Center, Group, Stack } from '@mantine/core'
import { Check, Pencil, Trash } from 'phosphor-react'
import { doRequest } from '../../../../../../requests/request'
import { IThesis, IThesisPresentation } from '../../../../../../requests/responses/thesis'
import { ApiError } from '../../../../../../requests/handler'
import PresentationsTable from '../../../../../../components/PresentationsTable/PresentationsTable'
import ReplacePresentationModal from '../ReplacePresentationModal/ReplacePresentationModal'
import SchedulePresentationModal from '../SchedulePresentationModal/SchedulePresentationModal'

const ThesisPresentationsTable = () => {
  const { access, thesis } = useLoadedThesisContext()

  const [editPresentationModal, setEditPresentationModal] = useState<IThesisPresentation>()
  const [schedulePresentationModal, setSchedulePresentationModal] = useState<IThesisPresentation>()

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

  const loading = deleting

  return (
    <Stack>
      <ReplacePresentationModal
        presentation={editPresentationModal}
        opened={!!editPresentationModal}
        onClose={() => setEditPresentationModal(undefined)}
      />
      <SchedulePresentationModal
        presentation={schedulePresentationModal}
        onClose={() => setSchedulePresentationModal(undefined)}
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
                      <Button
                        loading={loading}
                        size='xs'
                        onClick={() => setSchedulePresentationModal(presentation)}
                      >
                        <Check />
                      </Button>
                    )}
                    {(presentation.state === 'DRAFTED' || access.advisor) && (
                      <Button
                        loading={loading}
                        size='xs'
                        onClick={() => setEditPresentationModal(presentation)}
                      >
                        <Pencil />
                      </Button>
                    )}
                    {(presentation.state === 'DRAFTED' || access.advisor) && (
                      <Button
                        loading={loading}
                        size='xs'
                        onClick={() => deletePresentation(presentation)}
                      >
                        <Trash />
                      </Button>
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
