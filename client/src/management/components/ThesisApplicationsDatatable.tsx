import { useEffect, useState } from 'react'
import sortBy from 'lodash/sortBy'
import { ActionIcon, Badge, Group, Modal, MultiSelect, Stack, TextInput } from '@mantine/core'
import { DataTable, type DataTableSortStatus } from 'mantine-datatable'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { IconExternalLink, IconEyeEdit, IconSearch } from '@tabler/icons-react'
import moment from 'moment'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useThesisApplicationStore } from '../../state/zustand/useThesisApplicationStore'
import { useQuery } from '@tanstack/react-query'
import { Query } from '../../state/query'
import { getThesisAdvisors, getThesisApplications } from '../../network/thesisApplication'
import { ThesisAdvisor, ThesisApplication } from '../../interface/thesisApplication'
import { ApplicationStatus } from '../../interface/application'
import { Gender } from '../../interface/student'
import {
  ApplicationFormAccessMode,
  ThesisApplicationForm,
} from '../../student/form/ThesisApplicationForm'

interface Filters {
  male: boolean
  female: boolean
  status: string[]
}

export const ThesisApplicationsDatatable = (): JSX.Element => {
  const { applicationId } = useParams()
  const navigate = useNavigate()
  const { thesisApplications, setThesisApplications, setThesisAdvisors } =
    useThesisApplicationStore()
  const [bodyRef] = useAutoAnimate<HTMLTableSectionElement>()
  const [searchQuery, setSearchQuery] = useState('')
  const [tablePage, setTablePage] = useState(1)
  const [totalDisplayedRecords, setTotalDisplayedRecords] = useState(thesisApplications.length)
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

  const { data: fetchedThesisApplications, isLoading } = useQuery<ThesisApplication[]>({
    queryKey: [Query.THESIS_APPLICATION],
    queryFn: () => getThesisApplications(),
  })

  useEffect(() => {
    if (fetchedThesisApplications) {
      setThesisApplications(fetchedThesisApplications)
    }
  }, [fetchedThesisApplications, setThesisApplications])

  const { data: fetchedThesisAdvisors } = useQuery<ThesisAdvisor[]>({
    queryKey: [Query.THESIS_ADVISOR],
    queryFn: () => getThesisAdvisors(),
  })

  useEffect(() => {
    if (fetchedThesisAdvisors) {
      setThesisAdvisors(fetchedThesisAdvisors)
    }
  }, [fetchedThesisAdvisors, setThesisAdvisors])

  useEffect(() => {
    if (applicationId) {
      setSelectedApplicationToView(thesisApplications.find((a) => a.id === applicationId))
    } else {
      setSelectedApplicationToView(undefined)
    }
  }, [thesisApplications, applicationId])

  useEffect(() => {
    const from = (tablePage - 1) * tablePageSize
    const to = from + tablePageSize

    const filteredSortedData = sortBy(
      thesisApplications
        .filter(({ student }) => {
          return `${student.firstName ?? ''} ${student.lastName ?? ''} ${student.tumId ?? ''} ${
            student.matriculationNumber ?? ''
          }`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        })
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
        ),
      sortStatus.columnAccessor === 'fullName'
        ? ['student.firstName', 'student.lastName']
        : sortStatus.columnAccessor,
    )

    setTotalDisplayedRecords(filteredSortedData.length)

    setTableRecords(
      (sortStatus.direction === 'desc' ? filteredSortedData.reverse() : filteredSortedData).slice(
        from,
        to,
      ),
    )
    if (from > filteredSortedData.length) {
      setTablePage(1)
    }

    if (selectedApplicationToView) {
      setSelectedApplicationToView(
        thesisApplications.filter((ca) => ca.id === selectedApplicationToView.id).at(0),
      )
    }
  }, [
    thesisApplications,
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
        totalRecords={totalDisplayedRecords}
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
        onSortStatusChange={setSortStatus}
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
            accessor: 'fullName',
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
