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
import React from 'react'
import { GLOBAL_CONFIG } from '../../../../config/global'
import { Check, Copy } from 'phosphor-react'
import { useManagementAccess } from '../../../../hooks/authentication'
import PublicPresentationsTable from '../../../../components/PublicPresentationsTable/PublicPresentationsTable'

const PublicPresentationsSection = () => {
  const managementAccess = useManagementAccess()

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
      <PublicPresentationsTable includeDrafts={managementAccess} />
    </Stack>
  )
}

export default PublicPresentationsSection
