import { useAutoAnimate } from '@formkit/auto-animate/react'
import React from 'react'
import { IApplication } from '../../requests/responses/application'
import { DataTable } from 'mantine-datatable'
import { Badge } from '@mantine/core'
import { formatDate, formatUser } from '../../utils/format'
import { useApplicationsContext } from '../../contexts/ApplicationsProvider/hooks'
import { IApplicationsSort } from '../../contexts/ApplicationsProvider/context'
import { ApplicationStateColor } from '../../config/colors'

interface IApplicationsTableProps {
  onApplicationClick: (application: IApplication) => unknown
}

const ApplicationsTable = (props: IApplicationsTableProps) => {
  const { onApplicationClick } = props

  const [bodyRef] = useAutoAnimate<HTMLTableSectionElement>()

  const { applications, sort, setSort, page, setPage, limit } = useApplicationsContext()

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
      columns={[
        {
          accessor: 'state',
          title: 'State',
          textAlign: 'center',
          render: (application) => {
            return (
              <Badge color={ApplicationStateColor[application.state] ?? 'gray'}>
                {application.state}
              </Badge>
            )
          },
        },
        {
          accessor: 'user.firstName',
          title: 'Full name',
          render: (application) => formatUser(application.user),
        },
        {
          accessor: 'thesisTitle',
          title: 'Thesis Title',
          ellipsis: true,
          width: 300,
        },
        {
          accessor: 'createdAt',
          title: 'Created At',
          sortable: true,
          render: (application) => formatDate(application.createdAt),
        },
      ]}
      onRowClick={({ record: application }) => onApplicationClick(application)}
    />
  )
}

export default ApplicationsTable
