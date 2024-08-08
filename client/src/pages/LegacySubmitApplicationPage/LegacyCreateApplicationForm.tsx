import { isEmail, isNotEmpty, useForm } from '@mantine/form'
import {
  Box,
  Button,
  Center,
  Checkbox,
  Group,
  Image,
  LoadingOverlay,
  Select,
  Stack,
  Text,
  Textarea,
  Title,
  TextInput,
  MultiSelect,
  Grid,
} from '@mantine/core'
import { DeclarationOfDataConsent } from '../../components/DeclarationOfDataConsent/DeclarationOfDataConsent'
import LS1Logo from '../../static/ls1logo.png'
import { DatePickerInput } from '@mantine/dates'
import { useDisclosure } from '@mantine/hooks'
import { LegacyApplicationSuccessfulSubmission } from './components/LegacyApplicationSubmission/LegacyApplicationSuccessfulSubmission'
import { useState } from 'react'
import { Calendar } from 'phosphor-react'
import { GLOBAL_CONFIG } from '../../config/global'
import { doRequest } from '../../requests/request'
import { ILegacyCreateApplicationPayload } from '../../requests/payloads/application'
import UploadArea from '../../components/UploadArea/UploadArea'
import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import { AVAILABLE_COUNTRIES } from '../../config/countries'
import { showSimpleError, showSimpleSuccess } from '../../utils/notification'

const LegacyCreateApplicationForm = () => {
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
      isExchangeStudent: false,
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
      researchAreas: [],
      focusTopics: [],
      motivation: '',
      projects: '',
      interests: '',
      thesisTitle: '',
      declarationOfConsentAccepted: false,
      examinationReport: undefined,
      cv: undefined,
      degreeReport: undefined,
    },
    validateInputOnBlur: true,
    validate: {
      universityId: (value, values) =>
        /^[A-Za-z]{2}[0-9]{2}[A-Za-z]{3}$/.test(value ?? '') || values?.isExchangeStudent
          ? undefined
          : 'This is not a valid TUM ID',
      matriculationNumber: (value, values) =>
        /^\d{8}$/.test(value ?? '') || values?.isExchangeStudent
          ? undefined
          : 'This is not a valid matriculation number.',
      firstName: isNotEmpty('Please state your first name.'),
      lastName: isNotEmpty('Please state your last name'),
      email: isEmail('Invalid email'),
      gender: isNotEmpty('Please state your gender.'),
      nationality: isNotEmpty('Please state your nationality.'),
      motivation: (value) => {
        if (!value || !isNotEmpty(value)) {
          return 'Please state your motivation for the thesis.'
        } else if (value.length > 500) {
          return 'The maximum allowed number of characters is 500.'
        }
      },
      specialSkills: (value) => {
        if (!value) {
          return 'Please state your special skills.'
        } else if (value.length > 500) {
          return 'The maximum allowed number of characters is 500.'
        }
      },
      interests: (value) => {
        if (!value) {
          return 'Please state your interests.'
        } else if (value.length > 500) {
          return 'The maximum allowed number of characters is 500.'
        }
      },
      projects: (value) => {
        if (!value) {
          return 'Please state your projects.'
        } else if (value.length > 500) {
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
      studyDegree: isNotEmpty('Please state your study degree.'),
      studyProgram: isNotEmpty('Please state your study program.'),
      enrolledAt: isNotEmpty('Please state your enrollment date.'),
      desiredStartDate: isNotEmpty('Please state your desired start date.'),
      focusTopics: (value) => {
        if (!value || value.length === 0) {
          return 'Please specify at least one focus topic.'
        }
      },
      researchAreas: (value) => {
        if (!value || value.length === 0) {
          return 'Please specify at least one research area.'
        }
      },
      declarationOfConsentAccepted: (value) => !value,
      examinationReport: (value) => {
        if (!value) {
          return 'Please upload your examination report.'
        } else if (value.size > 1024 ** 3) {
          return 'The examination report should not exceed 3mb'
        }
      },
      cv: (value) => {
        if (!value) {
          return 'Please upload your CV.'
        } else if (value.size > 1024 ** 3) {
          return 'The CV should not exceed 3mb'
        }
      },
      degreeReport: (value) => {
        if (value && value.size > 1024 ** 3) {
          return 'The bachelor report should not exceed 3mb'
        }
      },
    },
  })

  return (
    <ContentContainer size='xl' px='md'>
      <Box mx='auto' pos='relative'>
        <LoadingOverlay visible={loadingOverlayVisible} overlayProps={{ blur: 2 }} />
        {applicationSuccessfullySubmitted ? (
          <LegacyApplicationSuccessfulSubmission
            title='Your application was successfully submitted!'
            text='We will contact you as soon as we have reviewed your application.'
          />
        ) : (
          <Stack>
            <Center>
              <Group grow>
                <Image src={LS1Logo} alt='Logo' />
                <Title ta='center' order={3}>
                  Thesis Application at LS1 Chair
                </Title>
              </Group>
            </Center>

            <form
              onSubmit={form.onSubmit(async (values) => {
                loadingOverlayHandlers.open()

                try {
                  const applicationPayload: ILegacyCreateApplicationPayload = {
                    universityId: values.universityId!,
                    matriculationNumber: values.matriculationNumber!,
                    isExchangeStudent: values.isExchangeStudent!,
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
                    desiredStartDate: values.desiredStartDate!,
                    researchAreas: values.researchAreas!,
                    focusTopics: values.focusTopics!,
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
                    showSimpleError(
                      `Failed to submit the application. Server responded with ${response.status}`,
                    )
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
                    required={!form.values.isExchangeStudent}
                    withAsterisk={!form.values.isExchangeStudent}
                    placeholder='TUM ID'
                    label='TUM ID'
                    {...form.getInputProps('universityId')}
                  />
                  <TextInput
                    type='text'
                    required={!form.values.isExchangeStudent}
                    withAsterisk={!form.values.isExchangeStudent}
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
                  type='text'
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
                    <Textarea
                      autosize
                      minRows={5}
                      label='Special Skills'
                      placeholder='Programming languages, certificates, etc.'
                      required={true}
                      {...form.getInputProps('specialSkills')}
                    />
                    {!form.errors.specialSkills && (
                      <Text fz='xs' ta='right'>{`${
                        form.values.specialSkills?.length ?? 0
                      } / 500`}</Text>
                    )}
                  </Grid.Col>
                  <Grid.Col span={{ md: 6 }}>
                    <Textarea
                      autosize
                      minRows={5}
                      label='Motivation'
                      placeholder='What are you looking for?'
                      required={true}
                      {...form.getInputProps('motivation')}
                    />
                    {!form.errors.motivation && (
                      <Text
                        fz='xs'
                        ta='right'
                      >{`${form.values.motivation?.length ?? 0} / 500`}</Text>
                    )}
                  </Grid.Col>
                </Grid>
                <Grid grow align='flex-start'>
                  <Grid.Col span={{ md: 6 }}>
                    <Textarea
                      autosize
                      minRows={5}
                      label='Interests'
                      placeholder='What are you interested in?'
                      required={true}
                      {...form.getInputProps('interests')}
                    />
                    {!form.errors.interests && (
                      <Text
                        fz='xs'
                        ta='right'
                      >{`${form.values.interests?.length ?? 0} / 500`}</Text>
                    )}
                  </Grid.Col>
                  <Grid.Col span={{ md: 6 }}>
                    <Textarea
                      autosize
                      minRows={5}
                      label='Projects'
                      placeholder='What projects have you worked on?'
                      required={true}
                      {...form.getInputProps('projects')}
                    />
                    {!form.errors.projects && (
                      <Text fz='xs' ta='right'>{`${form.values.projects?.length ?? 0} / 500`}</Text>
                    )}
                  </Grid.Col>
                </Grid>
                <Stack gap='0'>
                  <Textarea
                    autosize
                    minRows={1}
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
                <DatePickerInput
                  leftSection={<Calendar />}
                  label='Desired Thesis Start Date'
                  required={true}
                  {...form.getInputProps('desiredStartDate')}
                />
                <Group grow>
                  <MultiSelect
                    hidePickedOptions
                    label='Research Areas'
                    placeholder='Research Areas'
                    data={Object.keys(GLOBAL_CONFIG.research_areas).map((key) => {
                      return {
                        label: GLOBAL_CONFIG.research_areas[key] ?? key,
                        value: key,
                      }
                    })}
                    required={true}
                    {...form.getInputProps('researchAreas')}
                  />
                  <MultiSelect
                    hidePickedOptions
                    label='Focus Topics'
                    placeholder='Focus Topics'
                    data={Object.keys(GLOBAL_CONFIG.focus_topics).map((key) => {
                      return {
                        label: GLOBAL_CONFIG.focus_topics[key] ?? key,
                        value: key,
                      }
                    })}
                    required={true}
                    {...form.getInputProps('focusTopics')}
                  />
                </Group>
                <UploadArea
                  label='Examination Report'
                  required={true}
                  value={form.values.examinationReport}
                  onChange={(file) => form.setValues({ examinationReport: file })}
                />
                <UploadArea
                  label='CV'
                  required={true}
                  value={form.values.cv}
                  onChange={(file) => form.setValues({ cv: file })}
                />
                <UploadArea
                  label='Bachelor Report'
                  required={false}
                  value={form.values.degreeReport}
                  onChange={(file) => form.setValues({ degreeReport: file })}
                />
                <Checkbox
                  mt='md'
                  label={
                    <>
                      I have read the <DeclarationOfDataConsent text='declaration of consent' /> and
                      agree to the processing of my data.
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

export default LegacyCreateApplicationForm
