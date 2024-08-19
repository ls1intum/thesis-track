import { Button, Modal, Select, Stack, TextInput } from '@mantine/core'
import { ITopic } from '../../../../requests/responses/topic'
import { isNotEmpty, useForm } from '@mantine/form'
import { isNotEmptyUserList } from '../../../../utils/validation'
import { useEffect, useState } from 'react'
import DocumentEditor from '../../../../components/DocumentEditor/DocumentEditor'
import { GLOBAL_CONFIG } from '../../../../config/global'
import { doRequest } from '../../../../requests/request'
import { showSimpleError, showSimpleSuccess } from '../../../../utils/notification'
import { getApiResponseErrorMessage } from '../../../../requests/handler'
import UserMultiSelect from '../../../../components/UserMultiSelect/UserMultiSelect'
import { useTopicsContext } from '../../../../contexts/TopicsProvider/hooks'

interface ICreateTopicModalProps {
  opened: boolean
  onClose: () => unknown
  topic?: ITopic
}

const ReplaceTopicModal = (props: ICreateTopicModalProps) => {
  const { topic, opened, onClose } = props

  const { addTopic, updateTopic } = useTopicsContext()

  const form = useForm<{
    title: string
    problemStatement: string
    goals: string
    references: string
    type: string | null
    supervisorIds: string[]
    advisorIds: string[]
  }>({
    mode: 'controlled',
    initialValues: {
      title: '',
      type: '',
      problemStatement: '',
      goals: '',
      references: '',
      supervisorIds: GLOBAL_CONFIG.default_supervisors,
      advisorIds: [],
    },
    validateInputOnBlur: true,
    validate: {
      title: isNotEmpty('Title is required'),
      problemStatement: isNotEmpty('Problem statement is required'),
      supervisorIds: isNotEmptyUserList('supervisor'),
      advisorIds: isNotEmptyUserList('advisor'),
    },
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (opened && topic) {
      form.setInitialValues({
        title: topic.title,
        type: topic.type || '',
        problemStatement: topic.problemStatement,
        goals: topic.goals,
        references: topic.references,
        supervisorIds: topic.supervisors.map((user) => user.userId),
        advisorIds: topic.advisors.map((user) => user.userId),
      })
    }

    form.reset()
  }, [topic, opened])

  const onSubmit = async () => {
    setLoading(true)

    try {
      const response = await doRequest<ITopic>(`/v2/topics${topic ? `/${topic.topicId}` : ''}`, {
        method: topic ? 'PUT' : 'POST',
        requiresAuth: true,
        data: {
          title: form.values.title,
          type: form.values.type || null,
          problemStatement: form.values.problemStatement,
          goals: form.values.goals,
          references: form.values.references,
          supervisorIds: form.values.supervisorIds,
          advisorIds: form.values.advisorIds,
        },
      })

      if (response.ok) {
        if (topic) {
          updateTopic(response.data)
        } else {
          addTopic(response.data)
        }

        onClose()

        showSimpleSuccess(topic ? 'Topic updated successfully' : 'Topic created successfully')
      } else {
        showSimpleError(getApiResponseErrorMessage(response))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      size='xl'
      title={topic ? 'Edit Topic' : 'Create Topic'}
      opened={opened}
      onClose={onClose}
    >
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap='md'>
          <TextInput label='Title' required {...form.getInputProps('title')} />
          <Select
            label='Type'
            required
            data={[
              { value: '', label: 'Any' },
              ...Object.entries(GLOBAL_CONFIG.thesis_types).map(([key, value]) => ({
                value: key,
                label: value,
              })),
            ]}
            {...form.getInputProps('type')}
          />
          <UserMultiSelect
            label='Supervisor'
            required
            groups={['supervisor']}
            initialUsers={topic?.supervisors}
            {...form.getInputProps('supervisorIds')}
          />
          <UserMultiSelect
            label='Advisor'
            required
            groups={['advisor', 'supervisor']}
            initialUsers={topic?.advisors}
            {...form.getInputProps('advisorIds')}
          />
          <DocumentEditor
            label='Problem Statement'
            required
            editMode={true}
            {...form.getInputProps('problemStatement')}
          />
          <DocumentEditor label='Goals' editMode={true} {...form.getInputProps('goals')} />
          <DocumentEditor
            label='References'
            editMode={true}
            {...form.getInputProps('references')}
          />
          <Button type='submit' fullWidth disabled={!form.isValid()} loading={loading}>
            {topic ? 'Save changes' : 'Create topic'}
          </Button>
        </Stack>
      </form>
    </Modal>
  )
}

export default ReplaceTopicModal
