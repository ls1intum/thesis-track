import { Button, Group, Stack, Title } from '@mantine/core'
import { usePageTitle } from '../../hooks/theme'
import React, { useState } from 'react'
import { useManagementAccess } from '../../hooks/authentication'
import ThesesProvider from '../../providers/ThesesProvider/ThesesProvider'
import { Plus } from 'phosphor-react'
import ThesesFilters from '../../components/ThesesFilters/ThesesFilters'
import ThesesTable from '../../components/ThesesTable/ThesesTable'
import CreateThesisModal from './components/CreateThesisModal/CreateThesisModal'

const BrowseThesesPage = () => {
  usePageTitle('Browse Theses')

  const [openCreateThesisModal, setOpenCreateThesisModal] = useState(false)

  const managementAccess = useManagementAccess()

  return (
    <ThesesProvider fetchAll={true} limit={20}>
      <Stack>
        <Group>
          <Title>Browse Theses</Title>
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
          <Group>
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
        <CreateThesisModal
          opened={openCreateThesisModal}
          onClose={() => setOpenCreateThesisModal(false)}
        />
      </Stack>
    </ThesesProvider>
  )
}

export default BrowseThesesPage
