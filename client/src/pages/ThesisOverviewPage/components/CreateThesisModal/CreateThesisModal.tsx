import { Button, Modal, Stack, TextInput, Title } from '@mantine/core'
import { isNotEmpty, useForm } from '@mantine/form'
import { GLOBAL_CONFIG } from '../../../../config/global'
import React, { useState } from 'react'
import UserMultiSelect from '../../../../components/UserMultiSelect/UserMultiSelect'
import { useNavigate } from 'react-router-dom'
import { doRequest } from '../../../../requests/request'
import { IThesis } from '../../../../requests/responses/thesis'
import { notifications } from '@mantine/notifications'
import { isNotEmptyUserList } from '../../../../utils/validation'

interface ICreateThesisModalProps {
  opened: boolean
  onClose: () => unknown
}

const CreateThesisModal = (props: ICreateThesisModalProps) => {
  const { opened, onClose } = props

  const navigate = useNavigate()

  const form = useForm<{
    title: string
    students: string[]
    advisors: string[]
    supervisors: string[]
  }>({
    mode: 'controlled',
    initialValues: {
      title: '',
      students: [],
      advisors: [],
      supervisors: GLOBAL_CONFIG.default_supervisors,
    },
    validateInputOnBlur: true,
    validate: {
      title: isNotEmpty('Title must not be empty'),
      students: isNotEmptyUserList('student'),
      advisors: isNotEmptyUserList('advisor'),
      supervisors: isNotEmptyUserList('supervisor'),
    },
  })

  const [loading, setLoading] = useState(false)

  return (
    <Modal opened={opened} onClose={onClose} title={<Title order={2}>Create Thesis</Title>}>
      <form
        onSubmit={form.onSubmit(async (values) => {
          setLoading(true)

          try {
            const response = await doRequest<IThesis>('/v1/theses', {
              method: 'POST',
              requiresAuth: true,
              data: {
                thesisTitle: values.title,
                studentIds: values.students,
                advisorIds: values.advisors,
                supervisorIds: values.supervisors,
              },
            })

            if (response.ok) {
              navigate(`/theses/${response.data.thesisId}`)
            } else {
              notifications.show({
                color: 'red',
                autoClose: 10000,
                title: 'Error',
                message: `Failed to create thesis: ${response.status}`,
              })
            }
          } finally {
            setLoading(false)
          }
        })}
      >
        <Stack gap='md'>
          <TextInput
            type='text'
            required={true}
            placeholder='Thesis Title'
            label='Thesis Title'
            {...form.getInputProps('title')}
          />
          <UserMultiSelect
            label='Student'
            required={true}
            groups={[]}
            {...form.getInputProps('students')}
          />
          <UserMultiSelect
            label='Advisor'
            required={true}
            groups={['advisor', 'supervisor']}
            {...form.getInputProps('advisors')}
          />
          <UserMultiSelect
            label='Supervisor'
            required={true}
            groups={['supervisor']}
            maxValues={1}
            {...form.getInputProps('supervisors')}
          />
          <Button type='submit' loading={loading}>
            Create Thesis
          </Button>
        </Stack>
      </form>
    </Modal>
  )
}

export default CreateThesisModal
