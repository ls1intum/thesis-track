import { useEffect, useState } from 'react'
import { ActionIcon, Badge, MultiSelect, Stack, TextInput } from '@mantine/core'
import { DataTable, type DataTableSortStatus } from 'mantine-datatable'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Pageable } from '../../../../requests/responses/pageable'
import { Eye, MagnifyingGlass } from 'phosphor-react'
import { notifications } from '@mantine/notifications'
import { doRequest } from '../../../../requests/request'
import { useLoggedInUser } from '../../../../hooks/authentication'
import { formatDate } from '../../../../utils/format'
import { ApplicationState, IApplication } from '../../../../requests/responses/application'
import { useDebouncedValue } from '@mantine/hooks'
import LegacyApplicationReviewModal from '../LegacyApplicationReviewModal/LegacyApplicationReviewModal'

export const LegacyApplicationsDatatable = () => {
  const [bodyRef] = useAutoAnimate<HTMLTableSectionElement>()

  const navigate = useNavigate()
  const { applicationId } = useParams<{ applicationId: string }>()

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
            pageSize: limit,
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

  useEffect(() => {
    if (applicationId && applicationId !== openedApplication?.applicationId) {
      return doRequest<IApplication>(
        `/v2/applications/${applicationId}`,
        {
          method: 'GET',
          requiresAuth: true,
        },
        (err, res) => {
          if (res?.ok) {
            setOpenedApplication(res.data)
          }
        },
      )
    }
  }, [applicationId, openedApplication])

  return (
    <Stack>
      <LegacyApplicationReviewModal
        application={openedApplication}
        onClose={() => {
          navigate('/management/thesis-applications', {replace: true})
          setOpenedApplication(undefined)
        }}
        onUpdate={(newApplication) => {
          setApplications((prev) => {
            if (!prev) {
              return undefined
            }

            const index = prev.content.findIndex(
              (x) => x.applicationId === newApplication.applicationId,
            )

            if (index >= 0) {
              prev.content[index] = newApplication
            }

            return { ...prev }
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
              return <Badge color={color}>{application.state}</Badge>
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
              <Link
                to={`/management/thesis-applications/${application.applicationId}`}
                onClick={() => {
                  setOpenedApplication(application)
                }}
              >
                <ActionIcon variant='transparent' color='blue'>
                  <Eye size={16} />
                </ActionIcon>
              </Link>
            ),
          },
        ]}
        onRowClick={({ record: application }) => {
          setOpenedApplication(application)

          navigate(`/management/thesis-applications/${application.applicationId}`, {replace: true})
        }}
      />
    </Stack>
  )
}
