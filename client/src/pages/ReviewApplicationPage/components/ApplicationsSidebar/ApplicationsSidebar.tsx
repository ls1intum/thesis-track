import { Center, Pagination, Stack } from '@mantine/core'
import ApplicationsFilters from '../../../../components/ApplicationsFilters/ApplicationsFilters'
import React from 'react'
import { IApplication } from '../../../../requests/responses/application'
import { useApplicationsContext } from '../../../../contexts/ApplicationsProvider/hooks'
import ApplicationListItem from '../ApplicationListItem/ApplicationListItem'

interface IApplicationsSidebarProps {
  selected: IApplication | undefined
  onSelect: (application: IApplication) => unknown
}

const ApplicationsSidebar = (props: IApplicationsSidebarProps) => {
  const { selected, onSelect } = props

  const { page, setPage, applications } = useApplicationsContext()

  return (
    <Stack gap='sm'>
      <ApplicationsFilters size='sm' />
      {applications?.content.map((application) => (
        <ApplicationListItem
          key={application.applicationId}
          selected={application.applicationId === selected?.applicationId}
          application={application}
          onClick={() => onSelect(application)}
        />
      ))}
      <Center>
        <Pagination
          size='sm'
          total={applications?.totalPages || 0}
          value={page + 1}
          onChange={(newPage) => setPage(newPage - 1)}
        />
      </Center>
    </Stack>
  )
}

export default ApplicationsSidebar
