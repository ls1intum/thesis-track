import { ITopic } from '../../../../requests/responses/topic'
import { isNotEmpty, useForm } from '@mantine/form'
import { Accordion, Button, Select, Stack, TextInput } from '@mantine/core'
import DocumentEditor from '../../../../components/DocumentEditor/DocumentEditor'
import { useEffect, useState } from 'react'
import { doRequest } from '../../../../requests/request'
import { showSimpleError } from '../../../../utils/notification'
import { getApiResponseErrorMessage } from '../../../../requests/handler'
import { DateInput, DateValue } from '@mantine/dates'
import { getHtmlTextLength } from '../../../../utils/validation'
import { GLOBAL_CONFIG } from '../../../../config/global'
import { IApplication } from '../../../../requests/responses/application'
import TopicAccordionItem from '../../../../components/TopicAccordionItem/TopicAccordionItem'
import { formatThesisType } from '../../../../utils/format'

interface IMotivationStepProps {
  topic: ITopic | undefined
  application: IApplication | undefined
  onComplete: () => unknown
}

interface IMotivationStepForm {
  thesisTitle: string
  thesisType: string | null
  desiredStartDate: DateValue
  motivation: string
}

const MotivationStep = (props: IMotivationStepProps) => {
  const { topic, application, onComplete } = props

  const [loading, setLoading] = useState(false)

  const mergedTopic = application?.topic || topic

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
        if (!mergedTopic && !value) {
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

  useEffect(() => {
    if (application) {
      form.setValues({
        motivation: application.motivation,
        desiredStartDate: new Date(application.desiredStartDate),
        thesisType: application.thesisType,
        thesisTitle: application.thesisTitle || '',
      })
    }
  }, [application?.applicationId])

  const onSubmit = async (values: IMotivationStepForm) => {
    setLoading(true)

    try {
      const response = await doRequest(
        application ? `/v2/applications/${application.applicationId}` : '/v2/applications',
        {
          method: application ? 'PUT' : 'POST',
          requiresAuth: true,
          data: {
            topicId: mergedTopic?.topicId,
            thesisTitle: values.thesisTitle || null,
            thesisType: values.thesisType,
            desiredStartDate: values.desiredStartDate,
            motivation: values.motivation,
          },
        },
      )

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
        {mergedTopic ? (
          <Accordion variant='separated'>
            <TopicAccordionItem topic={mergedTopic} />
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
          data={(mergedTopic?.thesisTypes || Object.keys(GLOBAL_CONFIG.thesis_types)).map(
            (thesisType) => ({
              label: formatThesisType(thesisType),
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
          {application ? 'Update Application' : 'Submit Application'}
        </Button>
      </Stack>
    </form>
  )
}

export default MotivationStep
