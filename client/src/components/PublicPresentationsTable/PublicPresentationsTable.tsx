import PresentationsTable from '../PresentationsTable/PresentationsTable'
import React, { useEffect, useState } from 'react'
import { PaginationResponse } from '../../requests/responses/pagination'
import { IPublishedPresentation } from '../../requests/responses/thesis'
import { doRequest } from '../../requests/request'
import { showSimpleError } from '../../utils/notification'
import { getApiResponseErrorMessage } from '../../requests/handler'
import { useNavigate } from 'react-router-dom'

interface IPublicPresentationsTableProps {
  includeDrafts?: boolean
  limit?: number
  reducedData?: boolean
}

const PublicPresentationsTable = (props: IPublicPresentationsTableProps) => {
  const { includeDrafts = false, limit = 10, reducedData = false } = props

  const navigate = useNavigate()

  const [presentations, setPresentations] = useState<PaginationResponse<IPublishedPresentation>>()
  const [page, setPage] = useState(0)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    setPresentations(undefined)

    return doRequest<PaginationResponse<IPublishedPresentation>>(
      `/v2/published-presentations`,
      {
        method: 'GET',
        requiresAuth: false,
        params: {
          page,
          limit,
          includeDrafts,
        },
      },
      (res) => {
        if (res.ok) {
          setPresentations(res.data)
        } else {
          showSimpleError(getApiResponseErrorMessage(res))
        }
      },
    )
  }, [page, limit, includeDrafts, version])

  return (
    <PresentationsTable
      columns={
        reducedData
          ? [includeDrafts ? 'state' : '', 'students', 'location', 'scheduledAt']
          : [
              includeDrafts ? 'state' : '',
              'students',
              'type',
              'location',
              'streamUrl',
              'language',
              'scheduledAt',
              'actions',
            ]
      }
      presentations={presentations?.content}
      theses={presentations?.content.map((row) => row.thesis) || []}
      onRowClick={(presentation) => navigate(`/presentations/${presentation.presentationId}`)}
      pagination={{
        totalRecords: presentations?.totalElements ?? 0,
        recordsPerPage: limit,
        page: page + 1,
        onPageChange: (newPage) => setPage(newPage - 1),
      }}
      onChange={() => setVersion((prev) => prev + 1)}
    />
  )
}

export default PublicPresentationsTable
