import React from 'react'
import {
  useLoadedThesisContext,
  useThesisUpdateAction,
} from '../../../../../../contexts/ThesisProvider/hooks'
import { Button, Center } from '@mantine/core'
import { Trash } from 'phosphor-react'
import { doRequest } from '../../../../../../requests/request'
import { IThesis, IThesisPresentation } from '../../../../../../requests/responses/thesis'
import { ApiError } from '../../../../../../requests/handler'
import PresentationsTable from '../../../../../../components/PresentationsTable/PresentationsTable'

const ThesisPresentationsTable = () => {
  const { thesis } = useLoadedThesisContext()

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

  return (
    <PresentationsTable
      presentations={thesis.presentations}
      extraColumns={[
        {
          accessor: 'presentationId',
          title: 'Actions',
          textAlign: 'center',
          width: 100,
          ellipsis: true,
          render: (presentation) => (
            <Center>
              <Button loading={deleting} size='xs' onClick={() => deletePresentation(presentation)}>
                <Trash />
              </Button>
            </Center>
          ),
        },
      ]}
    />
  )
}

export default ThesisPresentationsTable
