import { useAutoAnimate } from '@formkit/auto-animate/react'
import { DataTable } from 'mantine-datatable'
import { Badge } from '@mantine/core'
import { formatDate, formatUser } from '../../utils/format'
import React from 'react'
import { useThesesContext } from '../../contexts/ThesesProvider/hooks'
import { IThesesSort } from '../../contexts/ThesesProvider/context'
import { ThesisStateColor } from '../../config/colors'
import { useNavigate } from 'react-router-dom'
import { IThesis } from '../../requests/responses/thesis'

const ThesesTable = () => {
  const [bodyRef] = useAutoAnimate<HTMLTableSectionElement>()

  const { theses, sort, setSort, page, setPage, limit } = useThesesContext()

  const navigate = useNavigate()

  const onThesisClick = (thesis: IThesis) => {
    navigate(`/theses/${thesis.thesisId}`)
  }

  return (
    <DataTable
      fetching={!theses}
      withTableBorder
      minHeight={200}
      noRecordsText='No theses to show'
      borderRadius='sm'
      verticalSpacing='md'
      striped
      highlightOnHover
      totalRecords={theses?.totalElements ?? 0}
      recordsPerPage={limit}
      page={page + 1}
      onPageChange={(x) => setPage(x - 1)}
      sortStatus={{
        direction: sort.direction,
        columnAccessor: sort.column,
      }}
      onSortStatusChange={(newSort) => {
        setSort({
          column: newSort.columnAccessor as IThesesSort['column'],
          direction: newSort.direction,
        })
      }}
      bodyRef={bodyRef}
      records={theses?.content}
      idAccessor='thesisId'
      columns={[
        {
          accessor: 'state',
          title: 'State',
          textAlign: 'center',
          render: (thesis) => {
            return <Badge color={ThesisStateColor[thesis.state] ?? 'gray'}>{thesis.state}</Badge>
          },
        },
        {
          accessor: 'advisors',
          title: 'Advisor',
          render: (thesis) => thesis.advisors.map((user) => formatUser(user)).join(', '),
        },
        {
          accessor: 'students',
          title: 'Student',
          render: (thesis) => thesis.students.map((user) => formatUser(user)).join(', '),
        },
        {
          accessor: 'title',
          title: 'Thesis Title',
          ellipsis: true,
        },
        {
          accessor: 'startDate',
          title: 'Start Date',
          sortable: true,
          render: (thesis) => formatDate(thesis.startDate),
        },
        {
          accessor: 'endDate',
          title: 'End Date',
          sortable: true,
          render: (thesis) => formatDate(thesis.endDate),
        },
      ]}
      onRowClick={({ record: thesis }) => onThesisClick(thesis)}
    />
  )
}

export default ThesesTable
