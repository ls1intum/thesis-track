import { Badge, Group, Stack, Title, Text, Paper, useMantineColorScheme } from '@mantine/core'
import { IApplication } from '../../../../requests/responses/application'
import { ApplicationStateColor } from '../../../../config/colors'
import { formatApplicationState, formatDate } from '../../../../utils/format'
import React from 'react'

interface IApplicationListItemProps {
  application: IApplication
  selected: boolean
  onClick: () => unknown
}

const ApplicationListItem = (props: IApplicationListItemProps) => {
  const { application, selected, onClick } = props

  const { colorScheme } = useMantineColorScheme()

  return (
    <Paper
      onClick={onClick}
      p='md'
      style={(theme) => ({
        backgroundColor: selected
          ? colorScheme === 'dark'
            ? theme.colors[theme.primaryColor][6]
            : theme.colors[theme.primaryColor][4]
          : colorScheme === 'dark'
            ? theme.colors.dark[6]
            : theme.colors.gray[1],
        cursor: 'pointer',
      })}
    >
      <Stack>
        <Group>
          <Title order={3}>
            {application.user.firstName} {application.user.lastName}
          </Title>
          <Badge color={ApplicationStateColor[application.state]} ml='auto'>
            {formatApplicationState(application.state)}
          </Badge>
        </Group>
        <Text size='sm'>Submission Date: {formatDate(application.createdAt)}</Text>
      </Stack>
    </Paper>
  )
}

export default ApplicationListItem
