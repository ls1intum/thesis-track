import { Skeleton, Title } from '@mantine/core'
import React, { useEffect, useState } from 'react'
import { doRequest } from '../../../../requests/request'
import { showSimpleError } from '../../../../utils/notification'
import { getApiResponseErrorMessage } from '../../../../requests/handler'
import { ITask } from '../../../../requests/responses/dashboard'
import { DataTable } from 'mantine-datatable'
import { useNavigate } from 'react-router-dom'

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

  return (
    <div>
      <Title order={2} mb='xs'>
        My Tasks
      </Title>
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
            title: 'Message',
          },
        ]}
        onRowClick={({ record }) => navigate(record.link)}
      />
    </div>
  )
}

export default MyTasksSection
