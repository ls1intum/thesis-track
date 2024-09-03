import { useAutoAnimate } from '@formkit/auto-animate/react'
import React from 'react'
import { IApplication } from '../../requests/responses/application'
import { DataTable, DataTableColumn } from 'mantine-datatable'
import { Badge, Center } from '@mantine/core'
import { formatApplicationState, formatDate, formatThesisType } from '../../utils/format'
import { useApplicationsContext } from '../../contexts/ApplicationsProvider/hooks'
import { IApplicationsSort } from '../../contexts/ApplicationsProvider/context'
import { ApplicationStateColor } from '../../config/colors'
import AvatarUser from '../AvatarUser/AvatarUser'

type ApplicationColumn =
  | 'state'
  | 'user'
  | 'thesis_title'
  | 'thesis_type'
  | 'reviewed_at'
  | 'created_at'

interface IApplicationsTableProps {
  onApplicationClick: (application: IApplication) => unknown
  columns?: ApplicationColumn[]
}

const ApplicationsTable = (props: IApplicationsTableProps) => {
  const {
    onApplicationClick,
    columns = ['state', 'thesis_title', 'thesis_type', 'user', 'created_at'],
  } = props

  const [bodyRef] = useAutoAnimate<HTMLTableSectionElement>()

  const { applications, sort, setSort, page, setPage, limit } = useApplicationsContext()

  const columnConfig: Record<ApplicationColumn, DataTableColumn<IApplication>> = {
    state: {
      accessor: 'state',
      title: 'State',
      textAlign: 'center',
      width: 120,
      render: (application) => {
        return (
          <Center>
            <Badge color={ApplicationStateColor[application.state]}>
              {formatApplicationState(application.state)}
            </Badge>
          </Center>
        )
      },
    },
    user: {
      accessor: 'user.firstName',
      title: 'Student',
      width: 170,
      render: (application) => <AvatarUser user={application.user} />,
    },
    thesis_title: {
      accessor: 'thesisTitle',
      title: 'Topic',
      render: (application) => application.thesisTitle,
    },
    thesis_type: {
      accessor: 'thesisType',
      title: 'Type',
      ellipsis: true,
      width: 150,
      render: (application) => formatThesisType(application.thesisType),
    },
    reviewed_at: {
      accessor: 'reviewedAt',
      title: 'Reviewed At',
      sortable: true,
      width: 150,
      render: (application) => formatDate(application.reviewedAt),
    },
    created_at: {
      accessor: 'createdAt',
      title: 'Created At',
      sortable: true,
      width: 150,
      render: (application) => formatDate(application.createdAt),
    },
  }

  return (
    <DataTable
      fetching={!applications}
      withTableBorder
      minHeight={200}
      noRecordsText='No applications to show'
      borderRadius='sm'
      verticalSpacing='md'
      striped
      highlightOnHover
      totalRecords={applications?.totalElements ?? 0}
      recordsPerPage={limit}
      page={page + 1}
      onPageChange={(x) => setPage(x - 1)}
      sortStatus={{
        direction: sort.direction,
        columnAccessor: sort.column,
      }}
      onSortStatusChange={(newSort) => {
        setSort({
          column: newSort.columnAccessor as IApplicationsSort['column'],
          direction: newSort.direction,
        })
      }}
      bodyRef={bodyRef}
      records={applications?.content}
      idAccessor='applicationId'
      columns={columns.map((column) => columnConfig[column])}
      onRowClick={({ record: application }) => onApplicationClick(application)}
    />
  )
}

export default ApplicationsTable
