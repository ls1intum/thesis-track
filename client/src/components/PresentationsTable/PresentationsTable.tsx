import { useAutoAnimate } from '@formkit/auto-animate/react'
import React from 'react'
import { DataTable, DataTableColumn } from 'mantine-datatable'
import { IPublishedPresentation, IThesisPresentation } from '../../requests/responses/thesis'
import { formatDate, formatPresentationType } from '../../utils/format'

interface IPresentationsTableProps<T> {
  presentations: T[] | undefined
  extraColumns?: Array<DataTableColumn<T>>
  pagination?: {
    totalRecords: number
    recordsPerPage: number
    page: number
    onPageChange: (page: number) => unknown
  }
}

const PresentationsTable = <T extends IThesisPresentation | IPublishedPresentation>(
  props: IPresentationsTableProps<T>,
) => {
  const { presentations, extraColumns, pagination } = props

  const [bodyRef] = useAutoAnimate<HTMLTableSectionElement>()

  const columns: Array<DataTableColumn<T>> = [
    {
      accessor: 'type',
      title: 'Type',
      textAlign: 'center',
      render: (presentation) => formatPresentationType(presentation.type),
    },
    {
      accessor: 'location',
      title: 'Location',
    },
    {
      accessor: 'streamUrl',
      title: 'Stream URL',
      render: (presentation) => (
        <a
          href={presentation.streamUrl || undefined}
          target='_blank'
          rel='noopener noreferrer nofollow'
        >
          {presentation.streamUrl}
        </a>
      ),
    },
    {
      accessor: 'scheduledAt',
      title: 'Scheduled At',
      render: (presentation) => formatDate(presentation.scheduledAt),
    },
    ...(extraColumns ?? []),
  ]

  if (pagination) {
    return (
      <DataTable
        withTableBorder
        minHeight={200}
        noRecordsText='No presentations scheduled yet'
        borderRadius='sm'
        verticalSpacing='md'
        striped
        highlightOnHover
        bodyRef={bodyRef}
        records={presentations}
        totalRecords={pagination.totalRecords}
        recordsPerPage={pagination.recordsPerPage}
        page={pagination.page}
        onPageChange={pagination.onPageChange}
        idAccessor='presentationId'
        columns={columns}
      />
    )
  } else {
    return (
      <DataTable
        withTableBorder
        minHeight={200}
        noRecordsText='No presentations scheduled yet'
        borderRadius='sm'
        verticalSpacing='md'
        striped
        highlightOnHover
        bodyRef={bodyRef}
        records={presentations}
        idAccessor='presentationId'
        columns={columns}
      />
    )
  }
}

export default PresentationsTable
