import React, { ReactNode } from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { DataTable, DataTableColumn } from 'mantine-datatable'
import { formatUser } from '../../utils/format'
import { useTopicsContext } from '../../contexts/TopicsProvider/hooks'
import { ITopic } from '../../requests/responses/topic'
import { useNavigate } from 'react-router-dom'

type TopicColumn = 'title' | 'advisor' | 'supervisor' | 'actions' | 'state'

interface ITopicsTableProps {
  columns?: TopicColumn[]
  actions?: (topic: ITopic) => ReactNode
}

const TopicsTable = (props: ITopicsTableProps) => {
  const { actions, columns = ['title', 'supervisor', 'advisor'] } = props

  const navigate = useNavigate()
  const [bodyRef] = useAutoAnimate<HTMLTableSectionElement>()

  const { topics, page, setPage, limit } = useTopicsContext()

  const columnConfig: Record<TopicColumn, DataTableColumn<ITopic>> = {
    title: {
      accessor: 'title',
      title: 'Title',
      ellipsis: true,
      width: 300,
    },
    actions: {
      accessor: 'actions',
      title: 'Actions',
      textAlign: 'center',
      render: (topic) => actions?.(topic),
    },
    supervisor: {
      accessor: 'supervisor',
      title: 'Supervisor',
      sortable: true,
      render: (topic) => topic.supervisors.map((user) => formatUser(user)).join(','),
    },
    advisor: {
      accessor: 'supervisor',
      title: 'Supervisor',
      sortable: true,
      render: (topic) => topic.advisors.map((user) => formatUser(user)).join(','),
    },
    state: {
      accessor: 'state',
      title: 'State',
      sortable: true,
      render: () => <></>,
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
      idAccessor='applicationId'
      columns={columns.map((column) => columnConfig[column])}
      onRowClick={({ record }) => navigate(`/topics/${record.topicId}`)}
    />
  )
}

export default TopicsTable
