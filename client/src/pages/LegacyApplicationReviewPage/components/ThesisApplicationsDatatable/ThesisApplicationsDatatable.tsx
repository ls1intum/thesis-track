import { useState } from 'react'
import { ActionIcon, Badge, Group, Modal, MultiSelect, Stack, TextInput } from '@mantine/core'
import { DataTable, type DataTableSortStatus } from 'mantine-datatable'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import moment from 'moment'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ApplicationFormAccessMode,
  LegacyThesisApplicationForm,
} from '../../../LegacySubmitApplicationPage/LegacyThesisApplicationForm'
import { Pageable } from '../../../../requests/types/pageable'
import { LegacyThesisApplication } from '../../../../legacy/interfaces/thesisApplication'
import { LegacyApplicationStatus } from '../../../../legacy/interfaces/application'
import { getThesisApplications } from '../../../../legacy/network/thesisApplication'
import { Query } from '../../../../legacy/query'
import { ArrowSquareOut, Eye, MagnifyingGlass } from 'phosphor-react'

export const ThesisApplicationsDatatable = (): JSX.Element => {
  const [bodyRef] = useAutoAnimate<HTMLTableSectionElement>()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  const [selectedApplications, setSelectedApplications] = useState<LegacyThesisApplication[]>([])
  const [openedApplication, setOpenedApplication] = useState<LegacyThesisApplication>()

  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<DataTableSortStatus<LegacyThesisApplication>>({
    columnAccessor: 'createdAt',
    direction: 'desc',
  })
  const [filteredStates, setFilteredStates] = useState<string[] | undefined>(['NOT_ASSESSED'])

  const { data: applications, isLoading } = useQuery<Pageable<LegacyThesisApplication>>({
    queryKey: [
      Query.THESIS_APPLICATION,
      page,
      limit,
      searchQuery,
      filteredStates?.join(','),
      sort.columnAccessor,
      sort.direction,
    ],
    queryFn: () =>
      getThesisApplications(
        page - 1,
        limit,
        filteredStates,
        searchQuery,
        sort.columnAccessor,
        sort.direction,
      ),
  })

  return (
    <Stack>
      {openedApplication && (
        <Modal
          centered
          size='90%'
          opened={!!openedApplication}
          onClose={() => {
            setOpenedApplication(undefined)
          }}
        >
          <LegacyThesisApplicationForm
            application={openedApplication}
            accessMode={ApplicationFormAccessMode.INSTRUCTOR}
          />
        </Modal>
      )}
      <TextInput
        style={{ margin: '1vh 0', width: '30vw' }}
        placeholder='Search applications...'
        leftSection={<MagnifyingGlass size={16} />}
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.currentTarget.value)
        }}
      />
      <DataTable
        fetching={isLoading}
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
        onPageChange={(x) => {
          setPage(x)
        }}
        recordsPerPageOptions={[5, 10, 15, 20, 25, 30, 35, 40, 50, 100, 200, 300]}
        onRecordsPerPageChange={(pageSize) => {
          setLimit(pageSize)
        }}
        sortStatus={sort}
        onSortStatusChange={(status) => {
          setPage(1)
          setSort(status)
        }}
        bodyRef={bodyRef}
        records={applications?.content}
        selectedRecords={selectedApplications}
        onSelectedRecordsChange={setSelectedApplications}
        columns={[
          {
            accessor: 'application_status',
            title: 'Status',
            textAlign: 'center',
            filter: (
              <MultiSelect
                hidePickedOptions
                label='Status'
                description='Show all applications having status in'
                data={Object.keys(LegacyApplicationStatus).map((key) => {
                  return {
                    label: LegacyApplicationStatus[key as keyof typeof LegacyApplicationStatus],
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
              switch (application.applicationStatus) {
                case 'ACCEPTED':
                  color = 'green'
                  break
                case 'ENROLLED':
                  color = 'green'
                  break
                case 'REJECTED':
                  color = 'red'
                  break
                default:
                  break
              }
              return <Badge color={color}>{LegacyApplicationStatus[application.applicationStatus]}</Badge>
            },
          },
          {
            accessor: 'student.tumId',
            title: 'TUM ID',
            sortable: true,
          },
          {
            accessor: 'student.matriculationNumber',
            title: 'Matriculation Nr.',
            sortable: true,
          },
          {
            accessor: 'student.email',
            title: 'Email',
            sortable: true,
          },
          {
            accessor: 'student.firstName',
            title: 'Full name',
            sortable: true,
            render: (application) =>
              `${application.student.firstName ?? ''} ${application.student.lastName ?? ''}`,
          },
          {
            accessor: 'createdAt',
            title: 'Created At',
            sortable: true,
            render: (application) =>
              `${moment(application.createdAt).format('DD. MMMM YYYY HH:mm')}`,
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
