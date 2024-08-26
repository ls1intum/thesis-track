import { useAutoAnimate } from '@formkit/auto-animate/react'
import { DataTable, DataTableColumn } from 'mantine-datatable'
import { formatDate, formatUser } from '../../utils/format'
import { useTopicsContext } from '../../contexts/TopicsProvider/hooks'
import { ITopic } from '../../requests/responses/topic'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@mantine/core'

type TopicColumn = 'title' | 'advisor' | 'supervisor' | 'state' | 'createdAt' | string

interface ITopicsTableProps {
  columns?: TopicColumn[]
  extraColumns?: Record<string, DataTableColumn<ITopic>>
}

const TopicsTable = (props: ITopicsTableProps) => {
  const { extraColumns, columns = ['title', 'supervisor', 'advisor'] } = props

  const navigate = useNavigate()
  const [bodyRef] = useAutoAnimate<HTMLTableSectionElement>()

  const { topics, page, setPage, limit } = useTopicsContext()

  const columnConfig: Record<TopicColumn, DataTableColumn<ITopic>> = {
    state: {
      accessor: 'state',
      title: 'State',
      textAlign: 'center',
      width: 100,
      render: (topic) =>
        topic.closedAt ? <Badge color='red'>Closed</Badge> : <Badge color='gray'>Open</Badge>,
    },
    title: {
      accessor: 'title',
      title: 'Title',
      ellipsis: true,
      width: 350,
    },
    supervisor: {
      accessor: 'supervisor',
      title: 'Supervisor',
      render: (topic) =>
        topic.supervisors
          .map((supervisor) => formatUser(supervisor, { withUniversityId: false }))
          .join(', '),
    },
    advisor: {
      accessor: 'advisor',
      title: 'Advisor',
      render: (topic) =>
        topic.advisors
          .map((advisor) => formatUser(advisor, { withUniversityId: false }))
          .join(', '),
    },
    createdAt: {
      accessor: 'createdAt',
      title: 'Created At',
      render: (record) => formatDate(record.createdAt),
    },
  }

  return (
    <DataTable
      fetching={!topics}
      withTableBorder
      minHeight={200}
      noRecordsText='No topics to show. You can suggest your own topic. The chair is always searching for motivated students'
      borderRadius='sm'
      verticalSpacing='md'
      striped
      highlightOnHover
      totalRecords={topics?.totalElements ?? 0}
      recordsPerPage={limit}
      page={page + 1}
      onPageChange={(x) => setPage(x - 1)}
      bodyRef={bodyRef}
      records={topics?.content}
      idAccessor='topicId'
      columns={columns.map((column) => columnConfig[column] || extraColumns?.[column])}
      onRowClick={({ record }) => navigate(`/topics/${record.topicId}`)}
    />
  )
}

export default TopicsTable
