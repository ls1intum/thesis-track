import React, { useState } from 'react'
import ThesesFilters from '../../components/ThesesFilters/ThesesFilters'
import ThesesProvider from '../../contexts/ThesesProvider/ThesesProvider'
import { usePageTitle } from '../../hooks/theme'
import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import ThesesTable from '../../components/ThesesTable/ThesesTable'
import ThesesGanttChart from '../../components/ThesesGanttChart/ThesesGanttChart'
import { Button, Group, Title } from '@mantine/core'
import { ThesisState } from '../../requests/responses/thesis'
import CreateThesisModal from './components/CreateThesisModal/CreateThesisModal'
import { Plus } from 'phosphor-react'
import { useHasGroupAccess } from '../../hooks/authentication'

const ThesisOverviewPage = () => {
  usePageTitle('Theses Overview')

  const [openCreateThesisModal, setOpenCreateThesisModal] = useState(false)

  const managementAccess = useHasGroupAccess('admin', 'supervisor', 'advisor')

  return (
    <ContentContainer>
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
          <Title mb='md'>Theses Overview</Title>
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
        {managementAccess && <ThesesGanttChart />}
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
    </ContentContainer>
  )
}

export default ThesisOverviewPage
