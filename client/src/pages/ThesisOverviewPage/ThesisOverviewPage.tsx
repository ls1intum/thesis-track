import React, { useState } from 'react'
import ThesesFilters from '../../components/ThesesFilters/ThesesFilters'
import ThesesProvider from '../../providers/ThesesProvider/ThesesProvider'
import { usePageTitle } from '../../hooks/theme'
import ThesesTable from '../../components/ThesesTable/ThesesTable'
import ThesesGanttChart from '../../components/ThesesGanttChart/ThesesGanttChart'
import { Button, Group, Space, Stack, Title } from '@mantine/core'
import { ThesisState } from '../../requests/responses/thesis'
import CreateThesisModal from './components/CreateThesisModal/CreateThesisModal'
import { Plus } from 'phosphor-react'
import { useManagementAccess } from '../../hooks/authentication'

const ThesisOverviewPage = () => {
  usePageTitle('Theses')

  const [openCreateThesisModal, setOpenCreateThesisModal] = useState(false)

  const managementAccess = useManagementAccess()

  return (
    <Stack>
      <CreateThesisModal
        opened={openCreateThesisModal}
        onClose={() => setOpenCreateThesisModal(false)}
      />
      <ThesesProvider
        fetchAll={true}
        defaultStates={
          managementAccess
            ? [
                ThesisState.PROPOSAL,
                ThesisState.WRITING,
                ThesisState.SUBMITTED,
                ThesisState.ASSESSED,
                ThesisState.GRADED,
              ]
            : [ThesisState.FINISHED]
        }
      >
        <Group>
          <Title mb='md'>Theses</Title>
          {managementAccess && (
            <Button
              ml='auto'
              leftSection={<Plus />}
              onClick={() => setOpenCreateThesisModal(true)}
              visibleFrom='md'
            >
              Create Thesis
            </Button>
          )}
        </Group>
        <ThesesFilters />
        {managementAccess && (
          <>
            <Space my='md' />
            <ThesesGanttChart />
          </>
        )}
        <Space my='md' />
        {managementAccess && (
          <Group mb='md'>
            <Button
              ml='auto'
              leftSection={<Plus />}
              onClick={() => setOpenCreateThesisModal(true)}
              hiddenFrom='md'
            >
              Create Thesis
            </Button>
          </Group>
        )}
        <ThesesTable />
      </ThesesProvider>
    </Stack>
  )
}

export default ThesisOverviewPage
