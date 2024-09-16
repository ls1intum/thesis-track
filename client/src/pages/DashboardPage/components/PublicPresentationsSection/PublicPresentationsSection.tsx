import {
  ActionIcon,
  CopyButton,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core'
import React, { useEffect, useState } from 'react'
import PresentationsTable from '../../../../components/PresentationsTable/PresentationsTable'
import { IPublishedPresentation } from '../../../../requests/responses/thesis'
import { doRequest } from '../../../../requests/request'
import { PaginationResponse } from '../../../../requests/responses/pagination'
import { showSimpleError } from '../../../../utils/notification'
import { getApiResponseErrorMessage } from '../../../../requests/handler'
import { GLOBAL_CONFIG } from '../../../../config/global'
import { Check, Copy } from 'phosphor-react'
import { useNavigate } from 'react-router-dom'

const PublicPresentationsSection = () => {
  const limit = 10

  const navigate = useNavigate()

  const [presentations, setPresentations] = useState<PaginationResponse<IPublishedPresentation>>()
  const [page, setPage] = useState(0)

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
  }, [page, limit])

  const calendarUrl =
    GLOBAL_CONFIG.calendar_url || `${GLOBAL_CONFIG.server_host}/api/v2/calendar/presentations`

  return (
    <Stack gap='xs'>
      <Title order={2}>Public Presentations</Title>
      <Group>
        <Text c='dimmed'>Subscribe to Calendar</Text>
        <div style={{ flexGrow: 1 }}>
          <CopyButton value={calendarUrl}>
            {({ copied, copy }) => (
              <TextInput
                value={calendarUrl}
                onChange={() => undefined}
                onClick={(e) => e.currentTarget.select()}
                rightSection={
                  <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position='right'>
                    <ActionIcon color={copied ? 'teal' : 'gray'} variant='subtle' onClick={copy}>
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                }
              />
            )}
          </CopyButton>
        </div>
      </Group>
      <PresentationsTable
        presentations={presentations?.content}
        onRowClick={(presentation) => navigate(`/presentations/${presentation.presentationId}`)}
        pagination={{
          totalRecords: presentations?.totalElements ?? 0,
          recordsPerPage: limit,
          page: page + 1,
          onPageChange: (newPage) => setPage(newPage - 1),
        }}
      />
    </Stack>
  )
}

export default PublicPresentationsSection
