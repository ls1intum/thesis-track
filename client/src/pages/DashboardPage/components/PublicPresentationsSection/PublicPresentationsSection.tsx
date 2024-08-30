import { ActionIcon, CopyButton, Group, Text, TextInput, Title, Tooltip } from '@mantine/core'
import React, { useEffect, useState } from 'react'
import PresentationsTable from '../../../../components/PresentationsTable/PresentationsTable'
import { IPublishedPresentation } from '../../../../requests/responses/thesis'
import { doRequest } from '../../../../requests/request'
import { PaginationResponse } from '../../../../requests/responses/pagination'
import { showSimpleError } from '../../../../utils/notification'
import { getApiResponseErrorMessage } from '../../../../requests/handler'
import { GLOBAL_CONFIG } from '../../../../config/global'
import { Check, Copy } from 'phosphor-react'

const PublicPresentationsSection = () => {
  const limit = 10

  const [presentations, setPresentations] = useState<PaginationResponse<IPublishedPresentation>>()
  const [page, setPage] = useState(0)

  useEffect(() => {
    setPresentations(undefined)

    return doRequest<PaginationResponse<IPublishedPresentation>>(
      `/v2/dashboard/presentations`,
      {
        method: 'GET',
        requiresAuth: true,
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
    <div>
      <Title order={2} mb='xs'>
        Public Presentations
      </Title>
      <Group mb='xs'>
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
        pagination={{
          totalRecords: presentations?.totalElements ?? 0,
          recordsPerPage: limit,
          page: page + 1,
          onPageChange: (newPage) => setPage(newPage - 1),
        }}
      />
    </div>
  )
}

export default PublicPresentationsSection
