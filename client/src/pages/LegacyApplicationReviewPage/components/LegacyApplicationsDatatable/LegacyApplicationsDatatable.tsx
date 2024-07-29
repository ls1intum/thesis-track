import { useEffect, useState } from 'react'
import { ActionIcon, Badge, Group, Modal, MultiSelect, Stack, TextInput } from '@mantine/core'
import { DataTable, type DataTableSortStatus } from 'mantine-datatable'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { Link } from 'react-router-dom'
import { Pageable } from '../../../../requests/responses/pageable'
import { ArrowSquareOut, Eye, MagnifyingGlass } from 'phosphor-react'
import { notifications } from '@mantine/notifications'
import { doRequest } from '../../../../requests/request'
import { useLoggedInUser } from '../../../../hooks/authentication'
import { formatDate } from '../../../../utils/format'
import { ApplicationState, IApplication } from '../../../../requests/responses/application'
import { useDebouncedState, useDebouncedValue } from '@mantine/hooks'
import LegacyApplicationReviewModal from '../LegacyApplicationReviewModal/LegacyApplicationReviewModal'

export const LegacyApplicationsDatatable = () => {
  const [bodyRef] = useAutoAnimate<HTMLTableSectionElement>()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  const [openedApplication, setOpenedApplication] = useState<IApplication>()

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 500)
  const [sort, setSort] = useState<DataTableSortStatus<IApplication>>({
    columnAccessor: 'createdAt',
    direction: 'desc',
  })
  const [filteredStates, setFilteredStates] = useState<string[] | undefined>(['NOT_ASSESSED'])

  const [applications, setApplications] = useState<Pageable<IApplication>>()

  const user = useLoggedInUser()

  useEffect(() => {
    setApplications(undefined)

    return doRequest<Pageable<IApplication>>(
      `/v2/applications`,
      {
        method: 'GET',
        params: {
          page: page - 1,
          limit,
          states: filteredStates?.join(',') ?? Object.keys(ApplicationState).join(','),
          searchQuery: debouncedSearchQuery,
          sortBy: sort.columnAccessor,
          sortOrder: sort.direction,
        },
        requiresAuth: true,
      },
      (error, res) => {
        if (!res?.ok) {
          notifications.show({
            color: 'red',
            autoClose: 10000,
            title: 'Error',
            message: `Could not fetch thesis applications. ${error || ''}`,
          })

          return setApplications({
            content: [],
            totalPages: 0,
            totalElements: 0,
            last: true,
            pageNumber: 0,
            pageSize: limit
          })
        }

        setApplications(res.data)
      },
    )
  }, [
    user.userId,
    page,
    limit,
    debouncedSearchQuery,
    filteredStates?.join(','),
    sort.columnAccessor,
    sort.direction,
  ])

  return (
    <Stack>
      <LegacyApplicationReviewModal
        application={openedApplication}
        onClose={() => {
          setOpenedApplication(undefined)
        }}
        onUpdate={newApplication => {
          setApplications(prev => {
            if (!prev) {
              return undefined
            }

            const index = prev.content.findIndex(x => x.applicationId === newApplication.applicationId)

            if (index >= 0) {
              prev.content[index] = newApplication
            }

            return {...prev}
          })
        }}
      />
      <TextInput
        style={{ margin: '1vh 0', width: '100%' }}
        placeholder='Search applications...'
        leftSection={<MagnifyingGlass size={16} />}
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.currentTarget.value)
        }}
      />
      <DataTable
        fetching={!applications}
        withTableBorder
        minHeight={200}
        noRecordsText='No records to show'
        borderRadius='sm'
        verticalSpacing='md'
        striped
        highlightOnHover
        totalRecords={applications?.totalElements ?? 0}
        recordsPerPage={limit}
        page={page}
        onPageChange={(x) => setPage(x)}
        recordsPerPageOptions={[5, 10, 15, 20, 25, 30, 35, 40, 50, 100, 200, 300]}
        onRecordsPerPageChange={(pageSize) => setLimit(pageSize)}
        sortStatus={sort}
        onSortStatusChange={(status) => {
          setPage(1)
          setSort(status)
        }}
        bodyRef={bodyRef}
        records={applications?.content}
        idAccessor='applicationId'
        columns={[
          {
            accessor: 'state',
            title: 'Status',
            textAlign: 'center',
            filter: (
              <MultiSelect
                hidePickedOptions
                label='Status'
                description='Show all applications having status in'
                data={Object.keys(ApplicationState).map((key) => {
                  return {
                    label: ApplicationState[key as keyof typeof ApplicationState],
                    value: key,
                  }
                })}
                value={filteredStates}
                placeholder='Search status...'
                onChange={(value) => {
                  setFilteredStates(value.length > 0 ? value : undefined)
                }}
                leftSection={<MagnifyingGlass size={16} />}
                clearable
                searchable
              />
            ),
            filtering: (filteredStates?.length ?? 0) > 0,
            render: (application) => {
              let color: string = 'gray'
              switch (application.state) {
                case ApplicationState.ACCEPTED:
                  color = 'green'
                  break
                case ApplicationState.REJECTED:
                  color = 'red'
                  break
                default:
                  break
              }
              return (
                <Badge color={color}>
                  {application.state}
                </Badge>
              )
            },
          },
          {
            accessor: 'user.universityId',
            title: 'University ID',
            sortable: true,
          },
          {
            accessor: 'user.matriculationNumber',
            title: 'Matriculation Nr.',
            sortable: true,
          },
          {
            accessor: 'user.email',
            title: 'Email',
            sortable: true,
          },
          {
            accessor: 'user.firstName',
            title: 'Full name',
            sortable: true,
            render: (application) =>
              `${application.user.firstName ?? ''} ${application.user.lastName ?? ''}`,
          },
          {
            accessor: 'createdAt',
            title: 'Created At',
            sortable: true,
            render: (application) => `${formatDate(application.createdAt, {})}`,
          },
          {
            accessor: 'actions',
            title: 'Actions',
            textAlign: 'right',
            render: (application) => (
              <Group justify='flex-end' wrap='nowrap'>
                <ActionIcon
                  variant='transparent'
                  color='blue'
                  onClick={(e) => {
                    e.stopPropagation()

                    setOpenedApplication(application)
                  }}
                >
                  <Eye size={16} />
                </ActionIcon>
                <Link
                  to='/management/thesis-applications'
                  onClick={(e) => {
                    e.stopPropagation()

                    setOpenedApplication(application)
                  }}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <ActionIcon
                    variant='transparent'
                    color='blue'
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ArrowSquareOut size={16} />
                  </ActionIcon>
                </Link>
              </Group>
            ),
          },
        ]}
        onRowClick={({ record: application }) => setOpenedApplication(application)}
      />
    </Stack>
  )
}
