import { ITopic } from '../../../../requests/responses/topic'
import { isNotEmpty, useForm } from '@mantine/form'
import { Accordion, Button, MultiSelect, Select, Stack, TextInput } from '@mantine/core'
import DocumentEditor from '../../../../components/DocumentEditor/DocumentEditor'
import TopicData from '../../../../components/TopicData/TopicData'
import { useState } from 'react'
import { doRequest } from '../../../../requests/request'
import { showSimpleError } from '../../../../utils/notification'
import { getApiResponseErrorMessage } from '../../../../requests/handler'
import { DateInput, DateValue } from '@mantine/dates'
import { getHtmlTextLength } from '../../../../utils/validation'
import { GLOBAL_CONFIG } from '../../../../config/global'

interface IMotivationStepProps {
  topic: ITopic | undefined
  onComplete: () => unknown
}

interface IMotivationStepForm {
  thesisTitle: string
  thesisType: string | null
  desiredStartDate: DateValue
  motivation: string
}

const MotivationStep = (props: IMotivationStepProps) => {
  const { topic, onComplete } = props

  const [loading, setLoading] = useState(false)
  const [opened, setOpened] = useState(false)

  const form = useForm<IMotivationStepForm>({
    mode: 'controlled',
    initialValues: {
      thesisTitle: '',
      thesisType: null,
      desiredStartDate: new Date(),
      motivation: '',
    },
    validateInputOnBlur: true,
    validate: {
      thesisTitle: (value) => {
        if (!topic && !value) {
          return 'Please state your suggested thesis title'
        }
      },
      thesisType: isNotEmpty('Please state your thesis type'),
      desiredStartDate: isNotEmpty('Please state your desired start date'),
      motivation: (value) => {
        if (!value) {
          return 'Please state your motivation'
        } else if (getHtmlTextLength(value) > 500) {
          return 'The maximum allowed number of characters is 500'
        }
      },
    },
  })

  const onSubmit = async (values: IMotivationStepForm) => {
    setLoading(true)

    try {
      const response = await doRequest('/v2/applications', {
        method: 'POST',
        requiresAuth: true,
        data: {
          topicId: topic?.topicId,
          thesisTitle: values.thesisTitle || null,
          thesisType: values.thesisType,
          desiredStartDate: values.desiredStartDate,
          motivation: values.motivation,
        },
      })

      if (response.ok) {
        onComplete()
      } else {
        showSimpleError(getApiResponseErrorMessage(response))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
      <Stack gap='md'>
        {topic ? (
          <Accordion
            variant='separated'
            value={opened ? 'opened' : ''}
            onChange={(value) => setOpened(value === 'opened')}
          >
            <Accordion.Item value='opened'>
              <Accordion.Control>{topic.title}</Accordion.Control>
              <Accordion.Panel>
                <TopicData topic={topic} />
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        ) : (
          <TextInput
            label='Suggested Thesis Title'
            required={true}
            {...form.getInputProps('thesisTitle')}
          />
        )}
        <Select
          label='Thesis Type'
          required={true}
          data={(topic?.thesisTypes || Object.keys(GLOBAL_CONFIG.thesis_types)).map(
            (thesisType) => ({
              label: GLOBAL_CONFIG.thesis_types[thesisType] ?? thesisType,
              value: thesisType,
            }),
          )}
          {...form.getInputProps('thesisType')}
        />
        <DateInput
          label='Desired Start Date'
          required={true}
          {...form.getInputProps('desiredStartDate')}
        />
        <DocumentEditor
          label='Motivation'
          required={true}
          editMode={true}
          maxLength={500}
          {...form.getInputProps('motivation')}
        />
        <Button type='submit' ml='auto' disabled={!form.isValid()} loading={loading}>
          Submit Application
        </Button>
      </Stack>
    </form>
  )
}

export default MotivationStep
