import React, { useState } from 'react'
import { DataTable, DataTableColumn } from 'mantine-datatable'
import {
  hasAdvisorAccess,
  hasStudentAccess,
  IPublishedPresentation,
  IPublishedThesis,
  isPublishedPresentation,
  IThesis,
  IThesisPresentation,
} from '../../requests/responses/thesis'
import { formatDate, formatPresentationType } from '../../utils/format'
import { GLOBAL_CONFIG } from '../../config/global'
import { Anchor, Badge, Button, Center, Group, Stack } from '@mantine/core'
import AvatarUserList from '../AvatarUserList/AvatarUserList'
import ReplacePresentationModal from './components/ReplacePresentationModal/ReplacePresentationModal'
import SchedulePresentationModal from './components/SchedulePresentationModal/SchedulePresentationModal'
import { Check, Pencil, Trash } from 'phosphor-react'
import { useThesisUpdateAction } from '../../providers/ThesisProvider/hooks'
import { doRequest } from '../../requests/request'
import { ApiError } from '../../requests/handler'
import { useUser } from '../../hooks/authentication'

type PresentationColumn =
  | 'state'
  | 'students'
  | 'type'
  | 'location'
  | 'streamUrl'
  | 'language'
  | 'scheduledAt'
  | string

interface IPresentationsTableProps<T> {
  presentations: T[] | undefined
  theses: IPublishedThesis[]
  onRowClick?: (presentation: T) => unknown
  columns?: PresentationColumn[]
  extraColumns?: Record<PresentationColumn, DataTableColumn<T>>
  pagination?: {
    totalRecords: number
    recordsPerPage: number
    page: number
    onPageChange: (page: number) => unknown
  }
  onChange?: () => unknown
}

const PresentationsTable = <T extends IThesisPresentation | IPublishedPresentation>(
  props: IPresentationsTableProps<T>,
) => {
  const {
    presentations,
    theses,
    onRowClick,
    columns = ['type', 'location', 'streamUrl', 'language', 'scheduledAt'],
    extraColumns,
    pagination,
    onChange,
  } = props

  const user = useUser()

  const [editPresentationModal, setEditPresentationModal] = useState<T>()
  const [schedulePresentationModal, setSchedulePresentationModal] = useState<T>()

  const [deleting, deletePresentation] = useThesisUpdateAction(async (presentation: T) => {
    const response = await doRequest<IThesis>(
      `/v2/theses/${presentation.thesisId}/presentations/${presentation.presentationId}`,
      {
        method: 'DELETE',
        requiresAuth: true,
      },
    )

    if (response.ok) {
      onChange?.()

      return response.data
    } else {
      throw new ApiError(response)
    }
  }, 'Presentation deleted successfully')

  const loading = deleting

  const columnConfig: Record<PresentationColumn, DataTableColumn<T>> = {
    state: {
      accessor: 'state',
      title: 'State',
      textAlign: 'center',
      width: 120,
      ellipsis: true,
      render: (presentation) => (
        <Center>
          <Badge color={presentation.state === 'DRAFTED' ? 'grey' : undefined}>
            {presentation.state}
          </Badge>
        </Center>
      ),
    },
    students: {
      accessor: 'students',
      title: 'Student',
      width: 180,
      ellipsis: true,
      render: (presentation) =>
        isPublishedPresentation(presentation) && (
          <AvatarUserList users={presentation.thesis.students} />
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
      render: (presentation) => presentation.location || 'Not available',
    },
    streamUrl: {
      accessor: 'streamUrl',
      title: 'Stream URL',
      render: (presentation) =>
        presentation.streamUrl ? (
          <Anchor
            href={presentation.streamUrl || undefined}
            target='_blank'
            rel='noopener noreferrer nofollow'
          >
            {presentation.streamUrl}
          </Anchor>
        ) : (
          'Not available'
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
    actions: {
      accessor: 'presentationId',
      title: 'Actions',
      textAlign: 'center',
      width: 180,
      ellipsis: true,
      render: (presentation) => (
        <Center onClick={(e) => e.stopPropagation()}>
          {hasStudentAccess(
            theses.find((thesis) => thesis.thesisId === presentation.thesisId),
            user,
          ) && (
            <Group gap='xs'>
              {presentation.state === 'DRAFTED' &&
                hasAdvisorAccess(
                  theses.find((thesis) => thesis.thesisId === presentation.thesisId),
                  user,
                ) && (
                  <Button
                    loading={loading}
                    size='xs'
                    onClick={() => setSchedulePresentationModal(presentation)}
                  >
                    <Check />
                  </Button>
                )}
              {presentation.state === 'DRAFTED' ||
                (hasAdvisorAccess(
                  theses.find((thesis) => thesis.thesisId === presentation.thesisId),
                  user,
                ) && (
                  <Button
                    loading={loading}
                    size='xs'
                    onClick={() => setEditPresentationModal(presentation)}
                  >
                    <Pencil />
                  </Button>
                ))}
              {presentation.state === 'DRAFTED' ||
                (hasAdvisorAccess(
                  theses.find((thesis) => thesis.thesisId === presentation.thesisId),
                  user,
                ) && (
                  <Button
                    loading={loading}
                    size='xs'
                    onClick={() => deletePresentation(presentation)}
                  >
                    <Trash />
                  </Button>
                ))}
            </Group>
          )}
        </Center>
      ),
    },
    ...(extraColumns ?? {}),
  }

  return (
    <Stack>
      <ReplacePresentationModal
        thesis={theses.find((row) => row.thesisId === editPresentationModal?.thesisId)}
        presentation={editPresentationModal}
        opened={!!editPresentationModal}
        onClose={() => setEditPresentationModal(undefined)}
        onChange={onChange}
      />
      <SchedulePresentationModal
        presentation={schedulePresentationModal}
        onClose={() => setSchedulePresentationModal(undefined)}
        onChange={onChange}
      />
      {pagination ? (
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
          columns={columns.filter((column) => column).map((column) => columnConfig[column])}
          onRowClick={onRowClick ? ({ record }) => onRowClick(record) : undefined}
        />
      ) : (
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
          columns={columns.filter((column) => column).map((column) => columnConfig[column])}
        />
      )}
    </Stack>
  )
}

export default PresentationsTable
