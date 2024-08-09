import { Button, Modal, Select, Stack, TextInput } from '@mantine/core'
import { isNotEmpty, useForm } from '@mantine/form'
import { GLOBAL_CONFIG } from '../../../../config/global'
import React, { useState } from 'react'
import UserMultiSelect from '../../../../components/UserMultiSelect/UserMultiSelect'
import { useNavigate } from 'react-router-dom'
import { doRequest } from '../../../../requests/request'
import { IThesis } from '../../../../requests/responses/thesis'
import { isNotEmptyUserList } from '../../../../utils/validation'
import { showSimpleError } from '../../../../utils/notification'

interface ICreateThesisModalProps {
  opened: boolean
  onClose: () => unknown
}

const CreateThesisModal = (props: ICreateThesisModalProps) => {
  const { opened, onClose } = props

  const navigate = useNavigate()

  const form = useForm<{
    title: string
    type: string | null
    students: string[]
    advisors: string[]
    supervisors: string[]
  }>({
    mode: 'controlled',
    initialValues: {
      title: '',
      type: null,
      students: [],
      advisors: [],
      supervisors: GLOBAL_CONFIG.default_supervisors,
    },
    validateInputOnBlur: true,
    validate: {
      title: isNotEmpty('Thesis title must not be empty'),
      type: isNotEmpty('Thesis type must not be empty'),
      students: isNotEmptyUserList('student'),
      advisors: isNotEmptyUserList('advisor'),
      supervisors: isNotEmptyUserList('supervisor'),
    },
  })

  const [loading, setLoading] = useState(false)

  return (
    <Modal opened={opened} onClose={onClose} title='Create Thesis'>
      <form
        onSubmit={form.onSubmit(async (values) => {
          setLoading(true)

          try {
            const response = await doRequest<IThesis>('/v2/theses', {
              method: 'POST',
              requiresAuth: true,
              data: {
                thesisTitle: values.title,
                thesisType: values.type,
                studentIds: values.students,
                advisorIds: values.advisors,
                supervisorIds: values.supervisors,
              },
            })

            if (response.ok) {
              navigate(`/theses/${response.data.thesisId}`)
            } else {
              showSimpleError(`Failed to create thesis: ${response.status}`)
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
          <Select
            label='Thesis Type'
            required={true}
            data={Object.entries(GLOBAL_CONFIG.thesis_types).map(([key, value]) => ({
              value: key,
              label: value,
            }))}
            {...form.getInputProps('type')}
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
