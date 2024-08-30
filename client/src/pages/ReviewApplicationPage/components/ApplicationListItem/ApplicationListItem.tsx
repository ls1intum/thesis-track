import { Badge, Group, Stack, Text, Paper } from '@mantine/core'
import { IApplication } from '../../../../requests/responses/application'
import { ApplicationStateColor } from '../../../../config/colors'
import { formatApplicationState, formatDate } from '../../../../utils/format'
import React from 'react'
import { useHighlightedBackgroundColor } from '../../../../hooks/theme'

interface IApplicationListItemProps {
  application: IApplication
  selected: boolean
  onClick: () => unknown
}

const ApplicationListItem = (props: IApplicationListItemProps) => {
  const { application, selected, onClick } = props

  const backgroundColor = useHighlightedBackgroundColor(selected)

  return (
    <Paper
      onClick={onClick}
      p='md'
      style={{
        backgroundColor,
        cursor: 'pointer',
      }}
    >
      <Stack gap='xs'>
        <Group wrap='nowrap'>
          <Text size='xl' fw='bold' truncate>
            {application.user.firstName} {application.user.lastName}
          </Text>
          <Badge color={ApplicationStateColor[application.state]} ml='auto'>
            {formatApplicationState(application.state)}
          </Badge>
        </Group>
        {application.topic && (
          <Text size='sm' truncate>
            Topic: {application.topic.title}
          </Text>
        )}
        <Text size='sm'>Submission Date: {formatDate(application.createdAt)}</Text>
      </Stack>
    </Paper>
  )
}

export default ApplicationListItem
