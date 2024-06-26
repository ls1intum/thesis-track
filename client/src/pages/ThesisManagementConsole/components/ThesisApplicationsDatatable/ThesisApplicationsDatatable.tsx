import { useEffect, useState } from 'react'
import { ActionIcon, Badge, Group, Modal, MultiSelect, Stack, TextInput } from '@mantine/core'
import { DataTable, type DataTableSortStatus } from 'mantine-datatable'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { IconExternalLink, IconEyeEdit, IconSearch } from '@tabler/icons-react'
import moment from 'moment'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Query } from '../../../../hooks/query'
import { getThesisApplications } from '../../../../network/thesisApplication'
import { ThesisApplication } from '../../../../interfaces/thesisApplication'
import { ApplicationStatus } from '../../../../interfaces/application'
import { Gender } from '../../../../interfaces/student'
import {
  ApplicationFormAccessMode,
  ThesisApplicationForm,
} from '../../../ThesisApplication/ThesisApplicationForm'
import { Pageable } from '../../../../interfaces/pageable'

interface Filters {
  male: boolean
  female: boolean
  status: string[]
}

const ThesisApplicationsDatatable = () => {
  const { applicationId } = useParams()
  const navigate = useNavigate()
  const [bodyRef] = useAutoAnimate<HTMLTableSectionElement>()
  const [searchQuery, setSearchQuery] = useState('')
  const [tablePage, setTablePage] = useState(1)
  const [tablePageSize, setTablePageSize] = useState(20)
  const [tableRecords, setTableRecords] = useState<ThesisApplication[]>([])
  const [selectedTableRecords, setSelectedTableRecords] = useState<ThesisApplication[]>([])
  const [selectedApplicationToView, setSelectedApplicationToView] = useState<
    ThesisApplication | undefined
  >(undefined)
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<ThesisApplication>>({
    columnAccessor: 'createdAt',
    direction: 'desc',
  })
  const [filters, setFilters] = useState<Filters>({
    male: false,
    female: false,
    status: [],
  })

  const { data: fetchedThesisApplications, isLoading } = useQuery<Pageable<ThesisApplication>>({
    queryKey: [
      Query.THESIS_APPLICATION,
      tablePage,
      tablePageSize,
      searchQuery,
      sortStatus.columnAccessor,
      sortStatus.direction,
    ],
    queryFn: () =>
      getThesisApplications(
        tablePage - 1,
        tablePageSize,
        searchQuery,
        sortStatus.columnAccessor,
        sortStatus.direction,
      ),
  })

  useEffect(() => {
    if (applicationId) {
      setSelectedApplicationToView(
        fetchedThesisApplications?.content.find((a) => a.id === applicationId),
      )
    } else {
      setSelectedApplicationToView(undefined)
    }
  }, [fetchedThesisApplications, applicationId])

  useEffect(() => {
    const filteredSortedData = fetchedThesisApplications?.content
      .filter(
        (application) =>
          filters.status.length === 0 || filters.status.includes(application.applicationStatus),
      )
      .filter((application) =>
        filters.female && application.student.gender
          ? Gender[application.student.gender] === Gender.FEMALE
          : true,
      )
      .filter((application) =>
        filters.male && application.student.gender
          ? Gender[application.student.gender] === Gender.MALE
          : true,
      )

    setTableRecords(filteredSortedData ?? [])

    if (selectedApplicationToView) {
      setSelectedApplicationToView(
        fetchedThesisApplications?.content
          .filter((ca) => ca.id === selectedApplicationToView.id)
          .at(0),
      )
    }
  }, [
    fetchedThesisApplications,
    tablePageSize,
    tablePage,
    searchQuery,
    filters,
    sortStatus,
    selectedApplicationToView,
  ])

  return (
    <Stack>
      {selectedApplicationToView && (
        <Modal
          centered
          size='90%'
          opened={!!selectedApplicationToView}
          onClose={() => {
            navigate('/management/thesis-applications')
            setSelectedApplicationToView(undefined)
          }}
        >
          <ThesisApplicationForm
            application={selectedApplicationToView}
            accessMode={ApplicationFormAccessMode.INSTRUCTOR}
          />
        </Modal>
      )}
      <TextInput
        style={{ margin: '1vh 0', width: '30vw' }}
        placeholder='Search applications...'
        leftSection={<IconSearch size={16} />}
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
        totalRecords={fetchedThesisApplications?.totalElements ?? 0}
        recordsPerPage={tablePageSize}
        page={tablePage}
        onPageChange={(page) => {
          setTablePage(page)
        }}
        recordsPerPageOptions={[5, 10, 15, 20, 25, 30, 35, 40, 50, 100, 200, 300]}
        onRecordsPerPageChange={(pageSize) => {
          setTablePageSize(pageSize)
        }}
        sortStatus={sortStatus}
        onSortStatusChange={(status) => {
          setTablePage(1)
          setSortStatus(status)
        }}
        bodyRef={bodyRef}
        records={tableRecords}
        selectedRecords={selectedTableRecords}
        onSelectedRecordsChange={setSelectedTableRecords}
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
                data={Object.keys(ApplicationStatus).map((key) => {
                  return {
                    label: ApplicationStatus[key as keyof typeof ApplicationStatus],
                    value: key,
                  }
                })}
                value={filters.status}
                placeholder='Search status...'
                onChange={(value) => {
                  setFilters({
                    ...filters,
                    status: value,
                  })
                }}
                leftSection={<IconSearch size={16} />}
                clearable
                searchable
              />
            ),
            filtering: filters.status.length > 0,
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
              return <Badge color={color}>{ApplicationStatus[application.applicationStatus]}</Badge>
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
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    navigate(`/management/thesis-applications/${application.id}`)
                  }}
                >
                  <IconEyeEdit size={16} />
                </ActionIcon>
                <Link
                  to={`/management/thesis-applications/${application.id}`}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <ActionIcon
                    variant='transparent'
                    color='blue'
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation()
                    }}
                  >
                    <IconExternalLink size={16} />
                  </ActionIcon>
                </Link>
              </Group>
            ),
          },
        ]}
        onRowClick={({ record: application }) => {
          navigate(`/management/thesis-applications/${application.id}`)
        }}
      />
    </Stack>
  )
}

export default ThesisApplicationsDatatable
