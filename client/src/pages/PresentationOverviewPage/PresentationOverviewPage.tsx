import {
  ActionIcon,
  CopyButton,
  Group,
  Stack,
  TextInput,
  Title,
  Tooltip,
  Text,
} from '@mantine/core'
import { usePageTitle } from '../../hooks/theme'
import { GLOBAL_CONFIG } from '../../config/global'
import { Check, Copy } from 'phosphor-react'
import PublicPresentationsTable from '../../components/PublicPresentationsTable/PublicPresentationsTable'

const PresentationOverviewPage = () => {
  usePageTitle('Presentations')

  const calendarUrl =
    GLOBAL_CONFIG.calendar_url || `${GLOBAL_CONFIG.server_host}/api/v2/calendar/presentations`

  return (
    <Stack>
      <Title>Presentations</Title>
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
      <PublicPresentationsTable includeDrafts={true} />
    </Stack>
  )
}

export default PresentationOverviewPage
