import { Center, Pagination, Stack, Text } from '@mantine/core'
import ApplicationsFilters from '../../../../components/ApplicationsFilters/ApplicationsFilters'
import React, { useEffect, useState } from 'react'
import { IApplication } from '../../../../requests/responses/application'
import { useApplicationsContext } from '../../../../contexts/ApplicationsProvider/hooks'
import ApplicationListItem from '../ApplicationListItem/ApplicationListItem'

interface IApplicationsSidebarProps {
  selected: IApplication | undefined
  isSmallScreen: boolean
  onSelect: (application: IApplication) => unknown
}

const ApplicationsSidebar = (props: IApplicationsSidebarProps) => {
  const { selected, isSmallScreen, onSelect } = props

  const { page, setPage, applications } = useApplicationsContext()

  const selectedIndex =
    applications?.content.findIndex((x) => x.applicationId === selected?.applicationId) ?? -1

  const [startAtLastApplication, setStartAtLastApplication] = useState(false)

  useEffect(() => {
    window.onkeydown = (e) => {
      let newIndex = selectedIndex

      newIndex += e.key === 'ArrowRight' ? 1 : 0
      newIndex += e.key === 'ArrowLeft' ? -1 : 0

      if (newIndex === selectedIndex) {
        return
      }

      if (applications && newIndex < 0) {
        // start at last application if user navigates to a previous page with arrow keys
        setStartAtLastApplication(page > 0)
        setPage(page > 0 ? page - 1 : 0)
      }

      if (applications && newIndex >= applications.content.length && !applications.last) {
        // make sure that state is reset when navigating to next page with arrow keys
        setStartAtLastApplication(false)
        setPage(page + 1)
      }

      if (applications?.content[newIndex]) {
        onSelect(applications.content[newIndex])
      }
    }

    return () => {
      window.onkeydown = null
    }
  }, [applications, page, selectedIndex])

  useEffect(() => {
    if (isSmallScreen) {
      return
    }

    if (page === 0 && !startAtLastApplication) {
      return
    }

    if (applications) {
      onSelect(
        startAtLastApplication
          ? applications.content[applications.content.length - 1]
          : applications.content[0],
      )
    }
  }, [
    page,
    startAtLastApplication,
    isSmallScreen,
    applications?.content.map((x) => x.applicationId).join(','),
  ])

  return (
    <Stack gap='sm'>
      <ApplicationsFilters size='sm' />
      {applications && applications.content.length === 0 && (
        <Text ta='center' fw='bold' my='md'>
          No applications found
        </Text>
      )}
      {applications?.content.map((application) => (
        <ApplicationListItem
          key={application.applicationId}
          selected={application.applicationId === selected?.applicationId}
          application={application}
          onClick={() => onSelect(application)}
        />
      ))}
      <Text c='dimmed' ta='center' size='xs'>
        Tip: Navigate with arrow left and right keys
      </Text>
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
