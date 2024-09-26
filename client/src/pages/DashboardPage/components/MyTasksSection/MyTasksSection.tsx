import { ActionIcon, Center, Group, Skeleton, Stack, Title } from '@mantine/core'
import React, { useEffect, useState } from 'react'
import { doRequest } from '../../../../requests/request'
import { showSimpleError } from '../../../../utils/notification'
import { getApiResponseErrorMessage } from '../../../../requests/handler'
import { ITask } from '../../../../requests/responses/dashboard'
import { DataTable } from 'mantine-datatable'
import { useNavigate } from 'react-router-dom'
import { Link as LinkIcon } from 'phosphor-react'

const MyTasksSection = () => {
  const navigate = useNavigate()

  const [tasks, setTasks] = useState<ITask[]>()

  useEffect(() => {
    setTasks(undefined)

    return doRequest<ITask[]>(
      `/v2/dashboard/tasks`,
      {
        method: 'GET',
        requiresAuth: true,
      },
      (res) => {
        if (res.ok) {
          setTasks(res.data)
        } else {
          showSimpleError(getApiResponseErrorMessage(res))
        }
      },
    )
  }, [])

  if (!tasks) {
    return <Skeleton height={200} />
  }

  if (!tasks.length) {
    return null
  }

  const redirectTask = (task: ITask) => {
    if (task.link.startsWith('http')) {
      window.location.replace(task.link)
    } else {
      navigate(task.link)
    }
  }

  return (
    <Stack gap='xs'>
      <Title order={2}>My Tasks</Title>
      <DataTable
        withTableBorder
        striped
        noHeader
        borderRadius='sm'
        verticalSpacing='md'
        highlightOnHover
        records={tasks}
        idAccessor='message'
        columns={[
          {
            accessor: 'message',
          },
          {
            accessor: 'actions',
            textAlign: 'center',
            width: 80,
            render: (record) => (
              <Center>
                <Group gap='xs' onClick={(e) => e.stopPropagation()} wrap='nowrap'>
                  <ActionIcon onClick={() => redirectTask(record)}>
                    <LinkIcon />
                  </ActionIcon>
                </Group>
              </Center>
            ),
          },
        ]}
        onRowClick={({ record }) => redirectTask(record)}
      />
    </Stack>
  )
}

export default MyTasksSection
