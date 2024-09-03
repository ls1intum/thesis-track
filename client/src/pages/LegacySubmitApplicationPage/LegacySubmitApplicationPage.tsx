import { isEmail, isNotEmpty, useForm } from '@mantine/form'
import {
  Box,
  Button,
  Checkbox,
  Group,
  LoadingOverlay,
  Select,
  Stack,
  Text,
  Title,
  TextInput,
  Grid,
  Card,
  Center,
  Anchor,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useDisclosure } from '@mantine/hooks'
import { useState } from 'react'
import { Calendar } from 'phosphor-react'
import { GLOBAL_CONFIG } from '../../config/global'
import { doRequest } from '../../requests/request'
import { ILegacyCreateApplicationPayload } from '../../requests/payloads/application'
import UploadArea from '../../components/UploadArea/UploadArea'
import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import { AVAILABLE_COUNTRIES } from '../../config/countries'
import { showSimpleError, showSimpleSuccess } from '../../utils/notification'
import { getApiResponseErrorMessage } from '../../requests/handler'
import DocumentEditor from '../../components/DocumentEditor/DocumentEditor'
import { getHtmlTextLength } from '../../utils/validation'
import { Link } from 'react-router-dom'
import { formatThesisType } from '../../utils/format'

const LegacySubmitApplicationPage = () => {
  const [loadingOverlayVisible, loadingOverlayHandlers] = useDisclosure(false)
  const [applicationSuccessfullySubmitted, setApplicationSuccessfullySubmitted] = useState(false)

  const form = useForm<
    Partial<ILegacyCreateApplicationPayload> & {
      declarationOfConsentAccepted: boolean
      examinationReport: File | undefined
      cv: File | undefined
      degreeReport: File | undefined
    }
  >({
    mode: 'controlled',
    initialValues: {
      universityId: '',
      gender: undefined,
      desiredStartDate: new Date(),
      firstName: '',
      lastName: '',
      email: '',
      matriculationNumber: '',
      enrolledAt: undefined,
      nationality: undefined,
      studyDegree: undefined,
      studyProgram: undefined,
      specialSkills: '',
      motivation: '',
      projects: '',
      interests: '',
      thesisTitle: '',
      thesisType: null,
      declarationOfConsentAccepted: false,
      examinationReport: undefined,
      cv: undefined,
      degreeReport: undefined,
    },
    validateInputOnBlur: true,
    validate: {
      universityId: (value) =>
        /^[A-Za-z]{2}[0-9]{2}[A-Za-z]{3}$/.test(value ?? '')
          ? undefined
          : 'This is not a valid TUM ID',
      matriculationNumber: (value) =>
        /^\d{8}$/.test(value ?? '') ? undefined : 'This is not a valid matriculation number.',
      firstName: isNotEmpty('Please state your first name.'),
      lastName: isNotEmpty('Please state your last name'),
      email: isEmail('Invalid email'),
      gender: isNotEmpty('Please state your gender.'),
      nationality: isNotEmpty('Please state your nationality.'),
      motivation: (value) => {
        if (!value || !isNotEmpty(value)) {
          return 'Please state your motivation for the thesis.'
        } else if (getHtmlTextLength(value) > 500) {
          return 'The maximum allowed number of characters is 500.'
        }
      },
      specialSkills: (value) => {
        if (!value) {
          return 'Please state your special skills.'
        } else if (getHtmlTextLength(value) > 500) {
          return 'The maximum allowed number of characters is 500.'
        }
      },
      interests: (value) => {
        if (!value) {
          return 'Please state your interests.'
        } else if (getHtmlTextLength(value) > 500) {
          return 'The maximum allowed number of characters is 500.'
        }
      },
      projects: (value) => {
        if (!value) {
          return 'Please state your projects.'
        } else if (getHtmlTextLength(value) > 500) {
          return 'The maximum allowed number of characters is 500.'
        }
      },
      thesisTitle: (value) => {
        if (!value) {
          return 'Please state your thesis title suggestion.'
        } else if (value.length > 200) {
          return 'The maximum allowed number of characters is 200.'
        }
      },
      thesisType: isNotEmpty('Please state your thesis type.'),
      studyDegree: isNotEmpty('Please state your study degree.'),
      studyProgram: isNotEmpty('Please state your study program.'),
      enrolledAt: isNotEmpty('Please state your enrollment date.'),
      desiredStartDate: isNotEmpty('Please state your desired start date.'),
      declarationOfConsentAccepted: (value) => !value,
      examinationReport: (value) => {
        if (!value) {
          return 'Please upload your examination report.'
        } else if (value.size > 2 * 1024 ** 3) {
          return 'The examination report should not exceed 2mb'
        }
      },
      cv: (value) => {
        if (!value) {
          return 'Please upload your CV.'
        } else if (value.size > 2 * 1024 ** 3) {
          return 'The CV should not exceed 2mb'
        }
      },
      degreeReport: (value) => {
        if (value && value.size > 2 * 1024 ** 3) {
          return 'The bachelor report should not exceed 2mb'
        }
      },
    },
  })

  return (
    <ContentContainer size='xl'>
      <Box mx='auto' pos='relative'>
        <LoadingOverlay visible={loadingOverlayVisible} overlayProps={{ blur: 2 }} />
        {applicationSuccessfullySubmitted ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
            }}
          >
            <Card withBorder p='xl'>
              <Title order={5}>Your application was successfully submitted!</Title>
              <Text c='dimmed'>
                We will contact you as soon as we have reviewed your application.
              </Text>
            </Card>
          </div>
        ) : (
          <Stack>
            <Center>
              <Title>Submit Thesis Application</Title>
            </Center>
            <form
              onSubmit={form.onSubmit(async (values) => {
                loadingOverlayHandlers.open()

                try {
                  const applicationPayload: ILegacyCreateApplicationPayload = {
                    universityId: values.universityId!,
                    matriculationNumber: values.matriculationNumber!,
                    firstName: values.firstName!,
                    lastName: values.lastName!,
                    gender: values.gender!,
                    nationality: values.nationality!,
                    email: values.email!,
                    studyDegree: values.studyDegree!,
                    studyProgram: values.studyProgram!,
                    enrolledAt: values.enrolledAt!,
                    specialSkills: values.specialSkills!,
                    motivation: values.motivation!,
                    interests: values.interests!,
                    projects: values.projects!,
                    thesisTitle: values.thesisTitle!,
                    thesisType: values.thesisType!,
                    desiredStartDate: values.desiredStartDate!,
                    customData: {},
                  }

                  const formData = new FormData()

                  formData.append(
                    'thesisApplication',
                    new Blob([JSON.stringify(applicationPayload)], { type: 'application/json' }),
                  )

                  formData.append('examinationReport', values.examinationReport!)
                  formData.append('cv', values.cv!)

                  if (values.degreeReport) {
                    formData.append('degreeReport', values.degreeReport)
                  }

                  const response = await doRequest('/v1/applications', {
                    method: 'POST',
                    requiresAuth: false,
                    formData,
                  })

                  if (response.ok) {
                    showSimpleSuccess('Your application was successfully submitted!')

                    setApplicationSuccessfullySubmitted(true)
                  } else {
                    showSimpleError(getApiResponseErrorMessage(response))
                  }
                } finally {
                  loadingOverlayHandlers.close()
                }
              })}
            >
              <Stack gap='md'>
                <Group grow align='flex-start'>
                  <TextInput
                    type='text'
                    required={true}
                    placeholder='TUM ID'
                    label='TUM ID'
                    {...form.getInputProps('universityId')}
                  />
                  <TextInput
                    type='text'
                    required={true}
                    placeholder='Matriculation Number'
                    label='Matriculation Number'
                    {...form.getInputProps('matriculationNumber')}
                  />
                </Group>
                <Group grow align='flex-start'>
                  <TextInput
                    type='text'
                    required={true}
                    placeholder='First Name'
                    label='First Name'
                    {...form.getInputProps('firstName')}
                  />
                  <TextInput
                    type='text'
                    required={true}
                    placeholder='Last Name'
                    label='Last Name'
                    {...form.getInputProps('lastName')}
                  />
                </Group>
                <Group grow align='flex-start'>
                  <Select
                    label='Gender'
                    placeholder='Gender'
                    data={Object.keys(GLOBAL_CONFIG.genders).map((key) => {
                      return {
                        label: GLOBAL_CONFIG.genders[key],
                        value: key,
                      }
                    })}
                    required={true}
                    searchable={true}
                    {...form.getInputProps('gender')}
                  />
                  <Select
                    label='Nationality'
                    placeholder='Nationality'
                    data={Object.entries(AVAILABLE_COUNTRIES).map(([key, value]) => {
                      return {
                        label: value,
                        value: key,
                      }
                    })}
                    required={true}
                    searchable={true}
                    {...form.getInputProps('nationality')}
                  />
                </Group>
                <TextInput
                  type='email'
                  required={true}
                  placeholder='your@email.com'
                  label='Email (preferrably a TUM email address)'
                  {...form.getInputProps('email')}
                />
                <Group grow align='flex-start'>
                  <Select
                    label='Study Degree'
                    placeholder='Study Degree'
                    data={Object.keys(GLOBAL_CONFIG.study_degrees).map((key) => {
                      return {
                        label: GLOBAL_CONFIG.study_degrees[key],
                        value: key,
                      }
                    })}
                    required={true}
                    searchable={true}
                    {...form.getInputProps('studyDegree')}
                  />
                  <Select
                    label='Study Program'
                    placeholder='Study Program'
                    data={Object.keys(GLOBAL_CONFIG.study_programs).map((key) => {
                      return {
                        label: GLOBAL_CONFIG.study_programs[key],
                        value: key,
                      }
                    })}
                    required={true}
                    searchable={true}
                    {...form.getInputProps('studyProgram')}
                  />
                  <DatePickerInput
                    leftSection={<Calendar />}
                    required={true}
                    label='Enrollment Date'
                    {...form.getInputProps('enrolledAt')}
                  />
                </Group>
                <Grid grow align='flex-start'>
                  <Grid.Col span={{ md: 6 }}>
                    <DocumentEditor
                      editMode={true}
                      label='Special Skills (Programming languages, certificates, etc.)'
                      required={true}
                      maxLength={500}
                      {...form.getInputProps('specialSkills')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ md: 6 }}>
                    <DocumentEditor
                      editMode={true}
                      label='Motivation (What are you looking for?)'
                      required={true}
                      maxLength={500}
                      {...form.getInputProps('motivation')}
                    />
                  </Grid.Col>
                </Grid>
                <Grid grow align='flex-start'>
                  <Grid.Col span={{ md: 6 }}>
                    <DocumentEditor
                      editMode={true}
                      label='Interests (What are you interested in?)'
                      required={true}
                      maxLength={500}
                      {...form.getInputProps('interests')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ md: 6 }}>
                    <DocumentEditor
                      editMode={true}
                      label='Projects (What projects have you worked on?)'
                      required={true}
                      maxLength={500}
                      {...form.getInputProps('projects')}
                    />
                  </Grid.Col>
                </Grid>
                <Grid>
                  <Grid.Col span={{ md: 8 }}>
                    <Stack gap='0'>
                      <TextInput
                        label='Thesis Title Suggestion'
                        placeholder='Thesis Title Suggestion'
                        required={true}
                        {...form.getInputProps('thesisTitle')}
                      />
                      {!form.errors.thesisTitle && (
                        <Text
                          fz='xs'
                          ta='right'
                        >{`${form.values.thesisTitle?.length ?? 0} / 200`}</Text>
                      )}
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={{ md: 4 }}>
                    <Select
                      label='Thesis Type'
                      required={true}
                      data={Object.keys(GLOBAL_CONFIG.thesis_types).map((thesisType) => ({
                        label: formatThesisType(thesisType),
                        value: thesisType,
                      }))}
                      {...form.getInputProps('thesisType')}
                    />
                  </Grid.Col>
                </Grid>
                <DatePickerInput
                  leftSection={<Calendar />}
                  label='Desired Thesis Start Date'
                  required={true}
                  {...form.getInputProps('desiredStartDate')}
                />
                <UploadArea
                  label='Examination Report'
                  required={true}
                  value={form.values.examinationReport}
                  onChange={(file) => form.setValues({ examinationReport: file })}
                  maxSize={2 * 1024 * 1024}
                />
                <UploadArea
                  label='CV'
                  required={true}
                  value={form.values.cv}
                  onChange={(file) => form.setValues({ cv: file })}
                  maxSize={2 * 1024 * 1024}
                />
                <UploadArea
                  label='Bachelor Report'
                  required={false}
                  value={form.values.degreeReport}
                  onChange={(file) => form.setValues({ degreeReport: file })}
                  maxSize={2 * 1024 * 1024}
                />
                <Checkbox
                  mt='md'
                  label={
                    <>
                      I have read the{' '}
                      <Anchor component={Link} to='/privacy'>
                        privacy notice
                      </Anchor>{' '}
                      and agree to the processing of my data.
                    </>
                  }
                  {...form.getInputProps('declarationOfConsentAccepted', { type: 'checkbox' })}
                />
                <Group>
                  <Button type='submit' disabled={!form.isValid()}>
                    Submit
                  </Button>
                </Group>
              </Stack>
            </form>
          </Stack>
        )}
      </Box>
    </ContentContainer>
  )
}

export default LegacySubmitApplicationPage
