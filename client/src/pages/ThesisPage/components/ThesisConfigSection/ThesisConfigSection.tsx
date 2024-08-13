import { IThesis, ThesisState } from '../../../../requests/responses/thesis'
import { Accordion, Badge, Button, Group, Select, Stack, Text, TextInput } from '@mantine/core'
import { useEffect, useState } from 'react'
import { isNotEmpty, useForm } from '@mantine/form'
import { DateInput, DateTimePicker, DateValue } from '@mantine/dates'
import UserMultiSelect from '../../../../components/UserMultiSelect/UserMultiSelect'
import { ThesisStateColor } from '../../../../config/colors'
import { isNotEmptyUserList } from '../../../../utils/validation'
import { isThesisClosed } from '../../../../utils/thesis'
import { doRequest } from '../../../../requests/request'
import ConfirmationButton from '../../../../components/ConfirmationButton/ConfirmationButton'
import {
  useLoadedThesisContext,
  useThesisUpdateAction,
} from '../../../../contexts/ThesisProvider/hooks'
import { formatThesisState } from '../../../../utils/format'
import { GLOBAL_CONFIG } from '../../../../config/global'
import { ApiError } from '../../../../requests/handler'

interface IThesisConfigSectionFormValues {
  title: string
  type: string
  visibility: string
  startDate: DateValue | undefined
  endDate: DateValue | undefined
  students: string[]
  advisors: string[]
  supervisors: string[]
  states: Array<{ state: ThesisState; changedAt: DateValue }>
}

const thesisDatesValidator = (
  _value: DateValue | undefined,
  values: IThesisConfigSectionFormValues,
): string | undefined => {
  const startDate = values.startDate
  const endDate = values.endDate

  if (!startDate && !endDate) {
    return undefined
  }

  if (!startDate || !endDate) {
    return 'Both start and end date must be set'
  }

  if (startDate.getTime() > endDate.getTime()) {
    return 'Start date must be before end date'
  }
}

const ThesisConfigSection = () => {
  const { thesis, access } = useLoadedThesisContext()

  const form = useForm<IThesisConfigSectionFormValues>({
    mode: 'controlled',
    initialValues: {
      title: thesis.title,
      type: thesis.type,
      visibility: thesis.visibility,
      startDate: thesis.startDate ? new Date(thesis.startDate) : undefined,
      endDate: thesis.endDate ? new Date(thesis.endDate) : undefined,
      students: thesis.students.map((user) => user.userId),
      advisors: thesis.advisors.map((user) => user.userId),
      supervisors: thesis.supervisors.map((user) => user.userId),
      states: thesis.states.map((state) => ({
        state: state.state,
        changedAt: new Date(state.startedAt),
      })),
    },
    validateInputOnBlur: true,
    validate: {
      title: isNotEmpty('Title must not be empty'),
      type: isNotEmpty('Type must not be empty'),
      visibility: isNotEmpty('Visibility must not be empty'),
      students: isNotEmptyUserList('student'),
      advisors: isNotEmptyUserList('advisor'),
      supervisors: isNotEmptyUserList('supervisor'),
      startDate: thesisDatesValidator,
      endDate: thesisDatesValidator,
      states: (value) => {
        let lastTimestamp = 0

        for (const state of value) {
          if (!state.changedAt) {
            return 'State must have a changed date'
          }

          if (state.changedAt.getTime() <= lastTimestamp) {
            return 'States must be in chronological order'
          }

          lastTimestamp = state.changedAt.getTime()
        }
      },
    },
  })

  useEffect(() => {
    form.validate()
  }, [form.values.startDate, form.values.endDate, form.values.states])

  useEffect(() => {
    form.setValues({
      title: thesis.title,
      type: thesis.type,
      visibility: thesis.visibility,
      startDate: thesis.startDate ? new Date(thesis.startDate) : undefined,
      endDate: thesis.endDate ? new Date(thesis.endDate) : undefined,
      students: thesis.students.map((user) => user.userId),
      advisors: thesis.advisors.map((user) => user.userId),
      supervisors: thesis.supervisors.map((user) => user.userId),
      states: thesis.states.map((state) => ({
        state: state.state,
        changedAt: new Date(state.startedAt),
      })),
    })
  }, [thesis])

  const [opened, setOpened] = useState(false)

  const [closing, onClose] = useThesisUpdateAction(async () => {
    const response = await doRequest<IThesis>(`/v2/theses/${thesis.thesisId}`, {
      method: 'DELETE',
      requiresAuth: true,
    })

    if (response.ok) {
      return response.data
    } else {
      throw new Error(`Failed to close thesis ${response.status}`)
    }
  }, 'Thesis closed successfully')

  const [updating, onSave] = useThesisUpdateAction(async () => {
    const values = form.values

    const response = await doRequest<IThesis>(`/v2/theses/${thesis.thesisId}`, {
      method: 'PUT',
      requiresAuth: true,
      data: {
        thesisTitle: values.title,
        thesisType: values.type,
        visibility: values.visibility,
        startDate: values.startDate,
        endDate: values.endDate,
        studentIds: values.students,
        advisorIds: values.advisors,
        supervisorIds: values.supervisors,
        states: values.states.map((state) => ({
          state: state.state,
          changedAt: state.changedAt,
        })),
      },
    })

    if (response.ok) {
      return response.data
    } else {
      throw new ApiError(response)
    }
  }, 'Thesis updated successfully')

  return (
    <Accordion
      variant='separated'
      value={opened ? 'open' : ''}
      onChange={(value) => setOpened(value === 'open')}
    >
      <Accordion.Item value='open'>
        <Accordion.Control>Configuration</Accordion.Control>
        <Accordion.Panel>
          <form onSubmit={form.onSubmit(onSave)}>
            <Stack gap='md'>
              <TextInput
                label='Thesis Title'
                required={true}
                disabled={!access.advisor}
                {...form.getInputProps('title')}
              />
              <Select
                label='Thesis Type'
                required={true}
                disabled={!access.advisor}
                data={Object.entries(GLOBAL_CONFIG.thesis_types).map(([key, value]) => ({
                  value: key,
                  label: value,
                }))}
                {...form.getInputProps('type')}
              />
              <Select
                label='Visibility'
                required={true}
                disabled={!access.advisor}
                data={[
                  { value: 'PUBLIC', label: 'Public' },
                  { value: 'INTERNAL', label: 'Internal' },
                  { value: 'PRIVATE', label: 'Private' },
                ]}
                {...form.getInputProps('visibility')}
              />
              <Group grow>
                <DateInput
                  label='Start Date'
                  disabled={!access.advisor}
                  {...form.getInputProps('startDate')}
                />
                <DateInput
                  label='End Date'
                  disabled={!access.advisor}
                  {...form.getInputProps('endDate')}
                />
              </Group>
              <UserMultiSelect
                required={true}
                disabled={!access.advisor}
                label='Student'
                groups={[]}
                initialUsers={thesis.students}
                {...form.getInputProps('students')}
              />
              <UserMultiSelect
                required={true}
                disabled={!access.advisor}
                label='Advisor'
                groups={['advisor', 'supervisor']}
                initialUsers={thesis.advisors}
                {...form.getInputProps('advisors')}
              />
              <UserMultiSelect
                required={true}
                disabled={!access.advisor}
                label='Supervisor'
                groups={['supervisor']}
                initialUsers={thesis.supervisors}
                maxValues={1}
                {...form.getInputProps('supervisors')}
              />
              {form.values.states.map((item, index) => (
                <Group key={item.state} grow>
                  <Group justify='center'>
                    <Text ta='center' fw='bold'>
                      State changed to
                    </Text>
                    <Badge color={ThesisStateColor[item.state]}>
                      {formatThesisState(item.state)}
                    </Badge>
                    <Text ta='center' fw='bold'>
                      at
                    </Text>
                  </Group>
                  <DateTimePicker
                    required={true}
                    disabled={!access.advisor}
                    value={item.changedAt}
                    error={form.errors.states}
                    onChange={(value) => {
                      form.values.states[index] = { state: item.state, changedAt: value }
                      form.setFieldValue('states', [...form.values.states])
                    }}
                  />
                </Group>
              ))}
              {access.advisor && (
                <Group>
                  {!isThesisClosed(thesis) && (
                    <ConfirmationButton
                      confirmationText='Are you sure you want to close the thesis? This action cannot be undone.'
                      confirmationTitle='Close Thesis'
                      variant='outline'
                      color='red'
                      loading={closing}
                      onClick={onClose}
                    >
                      Close Thesis
                    </ConfirmationButton>
                  )}
                  <Button type='submit' ml='auto' loading={updating} disabled={!form.isValid()}>
                    Update
                  </Button>
                </Group>
              )}
            </Stack>
          </form>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default ThesisConfigSection
