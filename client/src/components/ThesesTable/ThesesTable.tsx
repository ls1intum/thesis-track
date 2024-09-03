import { useAutoAnimate } from '@formkit/auto-animate/react'
import { DataTable, DataTableColumn } from 'mantine-datatable'
import { formatDate } from '../../utils/format'
import React from 'react'
import { useThesesContext } from '../../contexts/ThesesProvider/hooks'
import { IThesesSort } from '../../contexts/ThesesProvider/context'
import { useNavigate } from 'react-router-dom'
import { IThesis } from '../../requests/responses/thesis'
import { GLOBAL_CONFIG } from '../../config/global'
import ThesisStateBadge from '../ThesisStateBadge/ThesisStateBadge'
import { Center } from '@mantine/core'
import AvatarUserList from '../AvatarUserList/AvatarUserList'

type ThesisColumn =
  | 'state'
  | 'supervisors'
  | 'advisors'
  | 'students'
  | 'type'
  | 'title'
  | 'start_date'
  | 'end_date'

interface IThesesTableProps {
  columns?: ThesisColumn[]
}

const ThesesTable = (props: IThesesTableProps) => {
  const { columns = ['state', 'title', 'type', 'students', 'advisors', 'start_date', 'end_date'] } =
    props

  const [bodyRef] = useAutoAnimate<HTMLTableSectionElement>()

  const { theses, sort, setSort, page, setPage, limit } = useThesesContext()

  const navigate = useNavigate()

  const onThesisClick = (thesis: IThesis) => {
    navigate(`/theses/${thesis.thesisId}`)
  }

  const columnConfig: Record<ThesisColumn, DataTableColumn<IThesis>> = {
    state: {
      accessor: 'state',
      title: 'State',
      textAlign: 'center',
      width: 120,
      render: (thesis: IThesis) => {
        return (
          <Center>
            <ThesisStateBadge state={thesis.state} />
          </Center>
        )
      },
    },
    supervisors: {
      accessor: 'supervisors',
      title: 'Supervisor',
      width: 170,
      render: (thesis: IThesis) => (
        <AvatarUserList users={thesis.supervisors} withUniversityId={false} />
      ),
    },
    advisors: {
      accessor: 'advisors',
      title: 'Advisor(s)',
      ellipsis: true,
      width: 170,
      render: (thesis: IThesis) => (
        <AvatarUserList users={thesis.advisors} withUniversityId={false} />
      ),
    },
    students: {
      accessor: 'students',
      title: 'Student(s)',
      ellipsis: true,
      width: 170,
      render: (thesis: IThesis) => (
        <AvatarUserList users={thesis.students} withUniversityId={false} />
      ),
    },
    type: {
      accessor: 'type',
      title: 'Type',
      ellipsis: true,
      width: 150,
      render: (thesis: IThesis) => GLOBAL_CONFIG.thesis_types[thesis.type] ?? thesis.type,
    },
    title: {
      accessor: 'title',
      title: 'Title',
      ellipsis: true,
    },
    start_date: {
      accessor: 'startDate',
      title: 'Start Date',
      sortable: true,
      ellipsis: true,
      width: 130,
      render: (thesis: IThesis) => formatDate(thesis.startDate, { withTime: false }),
    },
    end_date: {
      accessor: 'endDate',
      title: 'End Date',
      sortable: true,
      ellipsis: true,
      width: 130,
      render: (thesis: IThesis) => formatDate(thesis.endDate, { withTime: false }),
    },
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
      columns={columns.map((column) => columnConfig[column])}
      onRowClick={({ record: thesis }) => onThesisClick(thesis)}
    />
  )
}

export default ThesesTable
