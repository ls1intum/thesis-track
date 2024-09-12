import { isNotEmpty, useForm } from '@mantine/form'
import { DateTimePicker, DateValue } from '@mantine/dates'
import { useEffect } from 'react'
import {
  useLoadedThesisContext,
  useThesisUpdateAction,
} from '../../../../../../contexts/ThesisProvider/hooks'
import { Alert, Button, Group, Modal, Select, Stack, TextInput } from '@mantine/core'
import { doRequest } from '../../../../../../requests/request'
import { IThesis } from '../../../../../../requests/responses/thesis'
import { ApiError } from '../../../../../../requests/handler'
import { formatPresentationType } from '../../../../../../utils/format'
import { GLOBAL_CONFIG } from '../../../../../../config/global'
import { Info } from 'phosphor-react'

interface ICreatePresentationModalProps {
  opened: boolean
  onClose: () => unknown
}

const CreatePresentationModal = (props: ICreatePresentationModalProps) => {
  const { opened, onClose } = props

  const { thesis } = useLoadedThesisContext()

  const form = useForm<{
    type: string
    visibility: string
    location: string
    streamUrl: string
    language: string | null
    date: DateValue
  }>({
    mode: 'controlled',
    initialValues: {
      type: 'INTERMEDIATE',
      visibility: 'PUBLIC',
      location: '',
      streamUrl: '',
      language: null,
      date: null,
    },
    validateInputOnBlur: true,
    validate: {
      type: isNotEmpty('Type is required'),
      visibility: isNotEmpty('Visibility is required'),
      location: (_value, values) => {
        if (!values.location && !values.streamUrl) {
          return 'Location or Stream URL is required'
        }
      },
      streamUrl: (_value, values) => {
        if (!values.location && !values.streamUrl) {
          return 'Location or Stream URL is required'
        }
      },
      language: isNotEmpty('Language is required'),
      date: (value) => {
        if (!value) {
          return 'Date is required'
        }

        if (value.getTime() <= Date.now()) {
          return 'Date must be in the future'
        }
      },
    },
  })

  useEffect(() => {
    form.validateField('location')
    form.validateField('streamUrl')
  }, [form.values.streamUrl, form.values.location])

  useEffect(() => {
    form.reset()
  }, [opened])

  const [creating, onCreatePresentation] = useThesisUpdateAction(async () => {
    const response = await doRequest<IThesis>(`/v2/theses/${thesis.thesisId}/presentations`, {
      method: 'POST',
      requiresAuth: true,
      data: {
        type: form.values.type,
        visibility: form.values.visibility,
        location: form.values.location,
        streamUrl: form.values.streamUrl,
        language: form.values.language,
        date: form.values.date,
      },
    })

    if (response.ok) {
      onClose()

      return response.data
    } else {
      throw new ApiError(response)
    }
  }, 'Presentation successfully scheduled')

  return (
    <Modal opened={opened} onClose={onClose} title='Create Presentation'>
      <form onSubmit={form.onSubmit(() => onCreatePresentation())}>
        <Stack gap='md'>
          {thesis.abstractText ? (
            <Alert variant='light' color='blue' title='Notice'>
              Please make sure that the thesis title and abstract are up to date before scheduling a
              presentation.
            </Alert>
          ) : (
            <Alert variant='light' color='red' title='Error'>
              The thesis does not have an abstract yet. Please add one before scheduling a
              presentation.
            </Alert>
          )}
          <Select
            label='Presentation Type'
            required
            data={['INTERMEDIATE', 'FINAL'].map((type) => ({
              label: formatPresentationType(type),
              value: type,
            }))}
            {...form.getInputProps('type')}
          />
          <Select
            label='Visibility'
            required
            data={[
              { label: 'Private', value: 'PRIVATE' },
              { label: 'Public', value: 'PUBLIC' },
            ]}
            {...form.getInputProps('visibility')}
          />
          <TextInput label='Location' {...form.getInputProps('location')} />
          <TextInput type='url' label='Stream URL' {...form.getInputProps('streamUrl')} />
          <Select
            label='Language'
            required
            data={Object.entries(GLOBAL_CONFIG.languages).map(([key, value]) => ({
              label: value,
              value: key,
            }))}
            {...form.getInputProps('language')}
          />
          <DateTimePicker label='Scheduled At' required {...form.getInputProps('date')} />
          <Group grow>
            <Button
              type='submit'
              onClick={onCreatePresentation}
              disabled={!thesis.abstractText || !form.isValid()}
              loading={creating}
            >
              Schedule Presentation
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}

export default CreatePresentationModal
