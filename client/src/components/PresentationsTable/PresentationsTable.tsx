import React from 'react'
import { DataTable, DataTableColumn } from 'mantine-datatable'
import {
  IPublishedPresentation,
  isThesisPresentation,
  IThesisPresentation,
} from '../../requests/responses/thesis'
import { formatDate, formatPresentationType } from '../../utils/format'
import { GLOBAL_CONFIG } from '../../config/global'
import { Anchor, Badge, Center } from '@mantine/core'

type PresentationColumn =
  | 'state'
  | 'type'
  | 'location'
  | 'streamUrl'
  | 'language'
  | 'scheduledAt'
  | string

interface IPresentationsTableProps<T> {
  presentations: T[] | undefined
  onRowClick?: (presentation: T) => unknown
  columns?: PresentationColumn[]
  extraColumns?: Record<PresentationColumn, DataTableColumn<T>>
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
  const {
    presentations,
    onRowClick,
    columns = ['type', 'location', 'streamUrl', 'language', 'scheduledAt'],
    extraColumns,
    pagination,
  } = props

  const columnConfig: Record<PresentationColumn, DataTableColumn<T>> = {
    state: {
      accessor: 'state',
      title: 'State',
      textAlign: 'center',
      width: 120,
      ellipsis: true,
      render: (presentation) => (
        <Center>
          {isThesisPresentation(presentation) && (
            <Badge color={presentation.state === 'DRAFTED' ? 'grey' : undefined}>
              {presentation.state}
            </Badge>
          )}
        </Center>
      ),
    },
    type: {
      accessor: 'type',
      title: 'Type',
      textAlign: 'center',
      width: 160,
      ellipsis: true,
      render: (presentation) => formatPresentationType(presentation.type),
    },
    location: {
      accessor: 'location',
      title: 'Location',
    },
    streamUrl: {
      accessor: 'streamUrl',
      title: 'Stream URL',
      render: (presentation) => (
        <Anchor
          href={presentation.streamUrl || undefined}
          target='_blank'
          rel='noopener noreferrer nofollow'
        >
          {presentation.streamUrl}
        </Anchor>
      ),
    },
    language: {
      accessor: 'language',
      title: 'Language',
      width: 120,
      ellipsis: true,
      render: (presentation) =>
        GLOBAL_CONFIG.languages[presentation.language] ?? presentation.language,
    },
    scheduledAt: {
      accessor: 'scheduledAt',
      title: 'Scheduled At',
      width: 160,
      ellipsis: true,
      render: (presentation) => formatDate(presentation.scheduledAt),
    },
    ...(extraColumns ?? {}),
  }

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
        records={presentations}
        totalRecords={pagination.totalRecords}
        recordsPerPage={pagination.recordsPerPage}
        page={pagination.page}
        onPageChange={pagination.onPageChange}
        idAccessor='presentationId'
        columns={columns.map((column) => columnConfig[column])}
        onRowClick={onRowClick ? ({ record }) => onRowClick(record) : undefined}
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
        records={presentations}
        idAccessor='presentationId'
        columns={columns.map((column) => columnConfig[column])}
      />
    )
  }
}

export default PresentationsTable
