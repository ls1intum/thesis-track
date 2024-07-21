import { isEmail, isNotEmpty, useForm } from '@mantine/form'
import { Dropzone, PDF_MIME_TYPE } from '@mantine/dropzone'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Center,
  Checkbox,
  Divider,
  Group,
  Image,
  Loader,
  LoadingOverlay,
  Select,
  Spoiler,
  Stack,
  Text,
  Textarea,
  Title,
  rem,
  useMantineTheme,
} from '@mantine/core'
import { DeclarationOfDataConsent } from '../../components/DeclarationOfDataConsent/DeclarationOfDataConsent'
import LS1Logo from '../../static/ls1logo.png'
import { DatePickerInput } from '@mantine/dates'
import { notifications } from '@mantine/notifications'
import { useDisclosure } from '@mantine/hooks'
import { LegacyApplicationSuccessfulSubmission } from './components/LegacyApplicationSubmission/LegacyApplicationSuccessfulSubmission'
import { useEffect, useState } from 'react'
import LegacyFormTextField from './form/LegacyFormTextField'
import LegacyFormSelectField from './form/LegacyFormSelectField'
import {
  getThesisApplicationBachelorReportFile,
  getThesisApplicationCvFile,
  getThesisApplicationExaminationFile,
  postThesisApplicatioAcceptance,
  postThesisApplicationAssessment,
  postThesisApplicationRejection,
  postThesisApplicationThesisAdvisorAssignment,
} from '../../legacy/network/thesisApplication'
import {
  LegacyThesisAdvisor,
  LegacyThesisApplication,
} from '../../legacy/interfaces/thesisApplication'
import { Calendar, ImageSquare, UploadSimple, X } from 'phosphor-react'
import { GLOBAL_CONFIG } from '../../config/global'
import { doRequest } from '../../requests/request'
import { formatDate } from '../../utils/format'
import { usePromiseLoader } from '../../hooks/utility'
import { downloadPdf } from '../../utils/blob'
import { LegacyApplicationFormAccessMode } from '../../legacy/interfaces/application'

countries.registerLocale(enLocale)
const countriesArr = Object.entries(countries.getNames('en', { select: 'alias' })).map(
  ([key, value]) => {
    return {
      label: value,
      value: key,
    }
  },
)

interface ThesisApplicationFormProps {
  accessMode: LegacyApplicationFormAccessMode
  application?: LegacyThesisApplication
}

const LegacyThesisApplicationForm = ({ application, accessMode }: ThesisApplicationFormProps) => {
  const theme = useMantineTheme()

  const [loadingOverlayVisible, loadingOverlayHandlers] = useDisclosure(false)
  const [applicationSuccessfullySubmitted, setApplicationSuccessfullySubmitted] = useState(false)
  const [notifyStudent, setNotifyStudent] = useState(true)
  const uploads = useForm<{
    examinationReport: File | undefined
    cv: File | undefined
    bachelorReport: File | undefined
  }>({
    initialValues: {
      examinationReport: undefined,
      cv: undefined,
      bachelorReport: undefined,
    },
    validate: {
      examinationReport: (value) => {
        if (!value) {
          return 'Please upload your examination report.'
        } else if (value && value.size > 1 * 1024 ** 2) {
          return 'The file should not exceed 3mb'
        }
      },
      cv: (value) => {
        if (!value) {
          return 'Please upload your CV.'
        } else if (value && value.size > 1 * 1024 ** 2) {
          return 'The file should not exceed 3mb'
        }
      },
    },
  })
  const form = useForm<LegacyThesisApplication>({
    initialValues: application
      ? {
          ...application,
          desiredThesisStart: new Date(application.desiredThesisStart),
          assessmentComment: application.assessmentComment ?? '',
        }
      : {
          id: '',
          student: {
            id: '',
            tumId: '',
            matriculationNumber: '',
            isExchangeStudent: false,
            email: '',
            firstName: '',
            lastName: '',
            nationality: '',
            gender: undefined,
            suggestedAsCoach: false,
            suggestedAsTutor: false,
            blockedByPm: false,
            reasonForBlockedByPm: '',
          },
          studyDegree: undefined,
          studyProgram: undefined,
          currentSemester: '',
          start: '',
          specialSkills: '',
          researchAreas: [],
          focusTopics: [],
          motivation: '',
          projects: '',
          interests: '',
          thesisTitle: '',
          desiredThesisStart: new Date(),
          applicationStatus: 'NOT_ASSESSED',
          assessmentComment: '',
        },
    validateInputOnChange: ['student.tumId'],
    validateInputOnBlur: true,
    validate: {
      student: {
        tumId: (value, values) =>
          /^[A-Za-z]{2}[0-9]{2}[A-Za-z]{3}$/.test(value ?? '') || values.student?.isExchangeStudent
            ? null
            : 'This is not a valid TUM ID',
        matriculationNumber: (value, values) =>
          /^\d{8}$/.test(value ?? '') || values.student?.isExchangeStudent
            ? null
            : 'This is not a valid matriculation number.',
        firstName: isNotEmpty('Please state your first name.'),
        lastName: isNotEmpty('Please state your last name'),
        email: isEmail('Invalid email'),
        gender: isNotEmpty('Please state your gender.'),
        nationality: isNotEmpty('Please state your nationality.'),
      },
      motivation: (value) => {
        if (!value || !isNotEmpty(value)) {
          return 'Please state your motivation for the thesis.'
        } else if (value.length > 500) {
          return 'The maximum allowed number of characters is 500.'
        }
      },
      specialSkills: (value) => {
        if (!value || !isNotEmpty(value)) {
          return 'Please state your special skills.'
        } else if (value.length > 500) {
          return 'The maximum allowed number of characters is 500.'
        }
      },
      interests: (value) => {
        if (!value || !isNotEmpty(value)) {
          return 'Please state your interests.'
        } else if (value.length > 500) {
          return 'The maximum allowed number of characters is 500.'
        }
      },
      projects: (value) => {
        if (!value || !isNotEmpty(value)) {
          return 'Please state your projects.'
        } else if (value.length > 500) {
          return 'The maximum allowed number of characters is 500.'
        }
      },
      thesisTitle: (value) => {
        if (!value || !isNotEmpty(value)) {
          return 'Please state your thesis title suggestion.'
        } else if (value.length > 200) {
          return 'The maximum allowed number of characters is 200.'
        }
      },
      studyDegree: isNotEmpty('Please state your study degree.'),
      studyProgram: isNotEmpty('Please state your study program.'),
      currentSemester: (value) => {
        return !value || value.length === 0 || !/\b([1-9]|[1-9][0-9])\b/.test(value)
          ? 'Please state your current semester.'
          : null
      },
    },
  })
  const consentForm = useForm({
    initialValues: {
      declarationOfConsentAccepted: false,
    },
    validateInputOnChange: true,
    validate: {
      declarationOfConsentAccepted: (value) => !value,
    },
  })

  const [fetchedThesisAdvisors, setFetchedThesisAdvisors] = useState<LegacyThesisAdvisor[]>()

  useEffect(() => {
    if (accessMode === LegacyApplicationFormAccessMode.INSTRUCTOR) {
      return doRequest<LegacyThesisAdvisor[]>(
        `/api/thesis-applications/thesis-advisors`,
        {
          method: 'GET',
          requiresAuth: true,
        },
        (err, res) => {
          if (!res?.ok) {
            notifications.show({
              color: 'red',
              autoClose: 10000,
              title: 'Error',
              message: `Could not fetch thesis advisors.`,
            })

            setFetchedThesisAdvisors([])
          } else {
            setFetchedThesisAdvisors(res.data)
          }
        },
      )
    }
  }, [accessMode])

  const assessThesisApplication = usePromiseLoader(() =>
    postThesisApplicationAssessment(application?.id ?? '', {
      status: form.values.applicationStatus,
      assessmentComment: form.values.assessmentComment ?? '',
    }),
  )

  const assignThesisApplicationToThesisAdvisor = usePromiseLoader((advisorId: string) =>
    postThesisApplicationThesisAdvisorAssignment(application?.id ?? '', advisorId),
  )

  const acceptThesisApplication = usePromiseLoader(() =>
    postThesisApplicatioAcceptance(application?.id ?? '', notifyStudent),
  )

  const rejectThesisApplication = usePromiseLoader(() =>
    postThesisApplicationRejection(application?.id ?? '', notifyStudent),
  )

  const [thesisAdvisorId, setThesisAdvisorId] = useState<string | null>(
    application?.thesisAdvisor?.id ?? null,
  )

  useEffect(() => {
    setThesisAdvisorId(application?.thesisAdvisor?.id ?? null)
  }, [application])

  return (
    <div style={{ padding: '0 0 5vh 0' }}>
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '80vw',
          gap: '2vh',
        }}
        mx='auto'
        pos='relative'
      >
        <LoadingOverlay visible={loadingOverlayVisible} overlayProps={{ blur: 2 }} />
        {applicationSuccessfullySubmitted ? (
          <LegacyApplicationSuccessfulSubmission
            title='Your application was successfully submitted!'
            text='We will contact you as soon as we have reviewed your application.'
          />
        ) : (
          <Stack>
            {accessMode === LegacyApplicationFormAccessMode.STUDENT && (
              <Group
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '15vw',
                    height: '15vw',
                  }}
                >
                  <Image src={LS1Logo} alt='LS1 Logo' />
                </div>
                <Center>
                  <Title order={3}>Thesis Application at LS1 Chair</Title>
                </Center>
              </Group>
            )}
            <form style={{ display: 'flex', flexDirection: 'column', gap: '2vh' }}>
              <Group grow align='flex-start'>
                <LegacyFormTextField
                  required={!form.values.student?.isExchangeStudent}
                  readOnly={accessMode === LegacyApplicationFormAccessMode.INSTRUCTOR}
                  label='TUM ID'
                  placeholder='TUM ID'
                  value={form.values.student?.tumId ?? ''}
                  textInputProps={form.getInputProps('student.tumId')}
                />
                <LegacyFormTextField
                  required={!form.values.student?.isExchangeStudent}
                  readOnly={accessMode === LegacyApplicationFormAccessMode.INSTRUCTOR}
                  label='Matriculation Number'
                  placeholder='Matriculation number'
                  value={form.values.student?.matriculationNumber ?? ''}
                  textInputProps={form.getInputProps('student.matriculationNumber')}
                />
              </Group>
              <Group grow align='flex-start'>
                <LegacyFormTextField
                  required
                  readOnly={accessMode === LegacyApplicationFormAccessMode.INSTRUCTOR}
                  label='First name'
                  placeholder='First Name'
                  value={form.values.student?.firstName ?? ''}
                  textInputProps={form.getInputProps('student.firstName')}
                />
                <LegacyFormTextField
                  required
                  readOnly={accessMode === LegacyApplicationFormAccessMode.INSTRUCTOR}
                  label='Last name'
                  placeholder='Last Name'
                  value={form.values.student?.lastName ?? ''}
                  textInputProps={form.getInputProps('student.lastName')}
                />
              </Group>
              <Group grow align='flex-start'>
                <LegacyFormSelectField
                  required
                  readOnly={accessMode === LegacyApplicationFormAccessMode.INSTRUCTOR}
                  label='Gender'
                  placeholder='Gender'
                  readValue={
                    GLOBAL_CONFIG.genders[form.values.student.gender ?? ''] ??
                    form.values.student.gender
                  }
                  data={Object.keys(GLOBAL_CONFIG.genders).map((key) => {
                    return {
                      label: GLOBAL_CONFIG.genders[key],
                      value: key,
                    }
                  })}
                  selectProps={form.getInputProps('student.gender')}
                />
                <LegacyFormSelectField
                  required
                  readOnly={accessMode === LegacyApplicationFormAccessMode.INSTRUCTOR}
                  label='Nationality'
                  placeholder='Nationality'
                  readValue={
                    countriesArr.find((c) => c.value == form.values.student.nationality)?.label ??
                    ''
                  }
                  data={countriesArr}
                  selectProps={form.getInputProps('student.nationality')}
                />
              </Group>
              <LegacyFormTextField
                required
                readOnly={accessMode === LegacyApplicationFormAccessMode.INSTRUCTOR}
                label='Email (preferrably a TUM email address)'
                placeholder='your@email.com'
                value={form.values.student?.email ?? ''}
                textInputProps={form.getInputProps('student.email')}
              />
              <Group grow align='flex-start'>
                <LegacyFormSelectField
                  required
                  readOnly={accessMode === LegacyApplicationFormAccessMode.INSTRUCTOR}
                  label='Study Degree'
                  placeholder='Study Degree'
                  readValue={
                    GLOBAL_CONFIG.study_degrees[form.values.studyDegree ?? ''] ??
                    form.values.studyDegree
                  }
                  data={Object.keys(GLOBAL_CONFIG.study_degrees).map((key) => {
                    return {
                      label: GLOBAL_CONFIG.study_degrees[key],
                      value: key,
                    }
                  })}
                  selectProps={form.getInputProps('studyDegree')}
                />
                <LegacyFormSelectField
                  required
                  readOnly={accessMode === LegacyApplicationFormAccessMode.INSTRUCTOR}
                  label='Study Program'
                  placeholder='Study Program'
                  readValue={
                    GLOBAL_CONFIG.study_programs[form.values.studyProgram ?? ''] ??
                    form.values.studyProgram
                  }
                  data={Object.keys(GLOBAL_CONFIG.study_programs).map((key) => {
                    return {
                      label: GLOBAL_CONFIG.study_programs[key],
                      value: key,
                    }
                  })}
                  selectProps={form.getInputProps('studyProgram')}
                />
                <LegacyFormTextField
                  required
                  numeric
                  readOnly={accessMode === LegacyApplicationFormAccessMode.INSTRUCTOR}
                  placeholder='Current semester'
                  label='Current Semester'
                  value={form.values.currentSemester ?? ''}
                  textInputProps={form.getInputProps('currentSemester')}
                />
              </Group>
              <Group grow align='flex-start'>
                <div>
                  <LegacyFormTextField
                    required
                    textArea
                    readOnly={accessMode === LegacyApplicationFormAccessMode.INSTRUCTOR}
                    label='Special Skills'
                    placeholder='Programming languages, certificates, etc.'
                    value={form.values.specialSkills ?? ''}
                    textAreaProps={form.getInputProps('specialSkills')}
                  />
                  {!form.errors.specialSkills &&
                    accessMode !== LegacyApplicationFormAccessMode.INSTRUCTOR && (
                      <Text fz='xs' ta='right'>{`${
                        form.values.specialSkills?.length ?? 0
                      } / 500`}</Text>
                    )}
                </div>
                <div>
                  <LegacyFormTextField
                    required
                    textArea
                    readOnly={accessMode === LegacyApplicationFormAccessMode.INSTRUCTOR}
                    label='Motivation'
                    placeholder='What are you looking for?'
                    value={form.values.motivation ?? ''}
                    textAreaProps={form.getInputProps('motivation')}
                  />
                  {!form.errors.motivation &&
                    accessMode !== LegacyApplicationFormAccessMode.INSTRUCTOR && (
                      <Text
                        fz='xs'
                        ta='right'
                      >{`${form.values.motivation?.length ?? 0} / 500`}</Text>
                    )}
                </div>
              </Group>
              <Group grow align='flex-start'>
                <div>
                  <LegacyFormTextField
                    required
                    textArea
                    readOnly={accessMode === LegacyApplicationFormAccessMode.INSTRUCTOR}
                    label='Interests'
                    placeholder='What are you interested in?'
                    value={form.values.interests ?? ''}
                    textAreaProps={form.getInputProps('interests')}
                  />
                  {!form.errors.interests &&
                    accessMode !== LegacyApplicationFormAccessMode.INSTRUCTOR && (
                      <Text
                        fz='xs'
                        ta='right'
                      >{`${form.values.interests?.length ?? 0} / 500`}</Text>
                    )}
                </div>
                <div>
                  <LegacyFormTextField
                    required
                    textArea
                    readOnly={accessMode === LegacyApplicationFormAccessMode.INSTRUCTOR}
                    label='Projects'
                    placeholder='What projects have you worked on?'
                    value={form.values.projects ?? ''}
                    textAreaProps={form.getInputProps('projects')}
                  />
                  {!form.errors.projects &&
                    accessMode !== LegacyApplicationFormAccessMode.INSTRUCTOR && (
                      <Text fz='xs' ta='right'>{`${form.values.projects?.length ?? 0} / 500`}</Text>
                    )}
                </div>
              </Group>
              <div>
                <LegacyFormTextField
                  required
                  textArea
                  readOnly={accessMode === LegacyApplicationFormAccessMode.INSTRUCTOR}
                  label='Thesis Title Suggestion'
                  placeholder='Thesis title suggestion'
                  value={form.values.thesisTitle ?? ''}
                  textAreaProps={form.getInputProps('thesisTitle')}
                />
                {!form.errors.thesisTitle &&
                  accessMode !== LegacyApplicationFormAccessMode.INSTRUCTOR && (
                    <Text
                      fz='xs'
                      ta='right'
                    >{`${form.values.thesisTitle?.length ?? 0} / 200`}</Text>
                  )}
              </div>
              {accessMode === LegacyApplicationFormAccessMode.INSTRUCTOR ? (
                <Stack style={{ gap: '0' }}>
                  <Text c='dimmed' fz='xs' fw={700}>
                    Desired Thesis Start Date
                  </Text>
                  <Text fz='sm' lineClamp={20}>
                    {formatDate(form.values.desiredThesisStart, { includeHours: false })}
                  </Text>
                </Stack>
              ) : (
                <DatePickerInput
                  leftSection={<Calendar />}
                  label='Desired Thesis Start Date'
                  {...form.getInputProps('desiredThesisStart')}
                />
              )}
              <Group grow>
                <LegacyFormSelectField
                  required
                  multiselect
                  readOnly={accessMode === LegacyApplicationFormAccessMode.INSTRUCTOR}
                  data={Object.keys(GLOBAL_CONFIG.research_areas).map((key) => {
                    return {
                      label: GLOBAL_CONFIG.research_areas[key] ?? key,
                      value: key,
                    }
                  })}
                  label='Research Areas'
                  placeholder='Research areas'
                  readValue={form.values.researchAreas
                    .map((ra) => GLOBAL_CONFIG.research_areas[ra] ?? ra)
                    .join(', ')}
                  multiselectProps={form.getInputProps('researchAreas')}
                />
                <LegacyFormSelectField
                  required
                  multiselect
                  readOnly={accessMode === LegacyApplicationFormAccessMode.INSTRUCTOR}
                  data={Object.keys(GLOBAL_CONFIG.focus_topics).map((key) => {
                    return {
                      label: GLOBAL_CONFIG.focus_topics[key] ?? key,
                      value: key,
                    }
                  })}
                  label='Focus Topics'
                  placeholder='Focus topics'
                  readValue={form.values.focusTopics
                    .map((ft) => GLOBAL_CONFIG.focus_topics[ft] ?? ft)
                    .join(', ')}
                  multiselectProps={form.getInputProps('focusTopics')}
                />
              </Group>
              {accessMode === LegacyApplicationFormAccessMode.STUDENT && (
                <Stack>
                  <Group align='left'>
                    <Text fw={500} fz='sm'>
                      Examination Report
                    </Text>
                    <Text color='red'>*</Text>
                  </Group>
                  {uploads.values.examinationReport && (
                    <Card shadow='sm' withBorder>
                      <Group align='apart'>
                        <Text c='dimmed' fz='sm'>
                          {uploads.values.examinationReport.name}
                        </Text>
                        <ActionIcon
                          onClick={() => {
                            uploads.setValues({ examinationReport: undefined })
                          }}
                        >
                          <X />
                        </ActionIcon>
                      </Group>
                    </Card>
                  )}
                  {!uploads.values.examinationReport && (
                    <Dropzone
                      name='Examination Report'
                      disabled={!!uploads.values.examinationReport}
                      onDrop={(files) => {
                        if (files[0]) {
                          uploads.setValues({
                            examinationReport: files[0],
                          })
                        }
                      }}
                      onReject={() => {
                        notifications.show({
                          color: 'red',
                          autoClose: 5000,
                          title: 'Error',
                          message: `Failed upload file. Please make sure the file is a PDF and does not exceed 1mb.`,
                        })
                      }}
                      maxSize={1 * 1024 ** 2}
                      accept={PDF_MIME_TYPE}
                    >
                      <Group
                        align='center'
                        gap='xl'
                        style={{ minHeight: rem(220), pointerEvents: 'none' }}
                      >
                        <Dropzone.Accept>
                          <UploadSimple size='3.2rem' color={theme.colors[theme.primaryColor][4]} />
                        </Dropzone.Accept>
                        <Dropzone.Reject>
                          <X size='3.2rem' color={theme.colors.red[4]} />
                        </Dropzone.Reject>
                        <Dropzone.Idle>
                          <ImageSquare size='3.2rem' />
                        </Dropzone.Idle>

                        <div>
                          <Text size='xl' inline>
                            Drag the file here or click to select file
                          </Text>
                          <Text size='sm' color='dimmed' inline mt={7}>
                            The file should not exceed 1mb
                          </Text>
                        </div>
                      </Group>
                    </Dropzone>
                  )}
                  <Group align='left'>
                    <Text fw={500} fz='sm'>
                      CV
                    </Text>
                    <Text color='red'>*</Text>
                  </Group>
                  {uploads.values.cv && (
                    <Card shadow='sm' withBorder>
                      <Group align='apart'>
                        <Text c='dimmed' fz='sm'>
                          {uploads.values.cv.name}
                        </Text>
                        <ActionIcon
                          onClick={() => {
                            uploads.setValues({ cv: undefined })
                          }}
                        >
                          <X />
                        </ActionIcon>
                      </Group>
                    </Card>
                  )}
                  {!uploads.values.cv && (
                    <Dropzone
                      name='CV'
                      disabled={!!uploads.values.cv}
                      onDrop={(files) => {
                        if (files[0]) {
                          uploads.setValues({
                            cv: files[0],
                          })
                        }
                      }}
                      onReject={() => {
                        notifications.show({
                          color: 'red',
                          autoClose: 5000,
                          title: 'Error',
                          message: `Failed upload file. Please make sure the file is a PDF and does not exceed 1mb.`,
                        })
                      }}
                      maxSize={1 * 1024 ** 2}
                      accept={PDF_MIME_TYPE}
                    >
                      <Group
                        align='center'
                        gap='xl'
                        style={{ minHeight: rem(220), pointerEvents: 'none' }}
                      >
                        <Dropzone.Accept>
                          <UploadSimple size='3.2rem' color={theme.colors[theme.primaryColor][4]} />
                        </Dropzone.Accept>
                        <Dropzone.Reject>
                          <X size='3.2rem' color={theme.colors.red[4]} />
                        </Dropzone.Reject>
                        <Dropzone.Idle>
                          <ImageSquare size='3.2rem' />
                        </Dropzone.Idle>

                        <div>
                          <Text size='xl' inline>
                            Drag the file here or click to select file
                          </Text>
                          <Text size='sm' color='dimmed' inline mt={7}>
                            The file should not exceed 1mb
                          </Text>
                        </div>
                      </Group>
                    </Dropzone>
                  )}
                  <Text fw={500} fz='sm'>
                    Bachelor Report
                  </Text>
                  {uploads.values.bachelorReport && (
                    <Card shadow='sm' withBorder>
                      <Group align='apart'>
                        <Text c='dimmed' fz='sm'>
                          {uploads.values.bachelorReport.name}
                        </Text>
                        <ActionIcon
                          onClick={() => {
                            uploads.setValues({ bachelorReport: undefined })
                          }}
                        >
                          <X />
                        </ActionIcon>
                      </Group>
                    </Card>
                  )}
                  {!uploads.values.bachelorReport && (
                    <Dropzone
                      name='Bachelor Report'
                      disabled={!!uploads.values.bachelorReport}
                      onDrop={(files) => {
                        if (files[0]) {
                          uploads.setValues({
                            bachelorReport: files[0],
                          })
                        }
                      }}
                      onReject={() => {
                        notifications.show({
                          color: 'red',
                          autoClose: 5000,
                          title: 'Error',
                          message: `Failed upload file. Please make sure the file is a PDF and does not exceed 1mb.`,
                        })
                      }}
                      maxSize={1 * 1024 ** 2}
                      accept={PDF_MIME_TYPE}
                    >
                      <Group
                        align='center'
                        gap='xl'
                        style={{ minHeight: rem(220), pointerEvents: 'none' }}
                      >
                        <Dropzone.Accept>
                          <UploadSimple size='3.2rem' color={theme.colors[theme.primaryColor][4]} />
                        </Dropzone.Accept>
                        <Dropzone.Reject>
                          <X size='3.2rem' color={theme.colors.red[4]} />
                        </Dropzone.Reject>
                        <Dropzone.Idle>
                          <ImageSquare size='3.2rem' />
                        </Dropzone.Idle>

                        <div>
                          <Text size='xl' inline>
                            Drag the file here or click to select file
                          </Text>
                          <Text size='sm' color='dimmed' inline mt={7}>
                            The file should not exceed 1mb
                          </Text>
                        </div>
                      </Group>
                    </Dropzone>
                  )}
                </Stack>
              )}
            </form>
            {accessMode === LegacyApplicationFormAccessMode.INSTRUCTOR && (
              <>
                <Divider
                  label={
                    <Text c='dimmed' fz='xs' fw='700'>
                      Uploaded Files
                    </Text>
                  }
                  labelPosition='center'
                />
                <Group grow>
                  {application?.examinationReportFilename && (
                    <Button
                      onClick={() => {
                        void (async () => {
                          const response = await getThesisApplicationExaminationFile(application.id)
                          if (response) {
                            downloadPdf(
                              response,
                              application.examinationReportFilename ?? 'examination-report',
                            )
                          }
                        })()
                      }}
                    >
                      Download Examination Report
                    </Button>
                  )}
                  {application?.cvFilename && (
                    <Button
                      onClick={() => {
                        void (async () => {
                          const response = await getThesisApplicationCvFile(application.id)

                          if (response) {
                            downloadPdf(response, application.cvFilename ?? 'cv')
                          }
                        })()
                      }}
                    >
                      Download CV
                    </Button>
                  )}
                  {application?.bachelorReportFilename && (
                    <Button
                      onClick={() => {
                        void (async () => {
                          const response = await getThesisApplicationBachelorReportFile(
                            application.id,
                          )
                          if (response) {
                            downloadPdf(
                              response,
                              application.bachelorReportFilename ?? 'bachelor-report',
                            )
                          }
                        })()
                      }}
                    >
                      Download Bachelor Report
                    </Button>
                  )}
                </Group>
                <Divider />
              </>
            )}
            {accessMode === LegacyApplicationFormAccessMode.INSTRUCTOR && (
              <>
                <Select
                  label='Thesis Advisor'
                  data={fetchedThesisAdvisors?.map((ta) => {
                    return {
                      value: ta.id ?? '',
                      label: `${ta.firstName} ${ta.lastName} (${ta.tumId})`,
                    }
                  })}
                  value={thesisAdvisorId}
                  onChange={(value) => {
                    setThesisAdvisorId(value)
                    if (application && value) {
                      void assignThesisApplicationToThesisAdvisor.execute(value)
                    }
                  }}
                />
                <Textarea
                  label='Comment'
                  autosize
                  minRows={5}
                  placeholder='Comment'
                  {...form.getInputProps('assessmentComment')}
                />
                {accessMode === LegacyApplicationFormAccessMode.INSTRUCTOR && (
                  <Button
                    onClick={() => {
                      if (application) {
                        void assessThesisApplication.execute()
                      }
                    }}
                  >
                    Save
                  </Button>
                )}
                <Group align='right'>
                  <Button
                    style={{ width: '20vw' }}
                    variant='outline'
                    color='red'
                    disabled={rejectThesisApplication.isLoading}
                    onClick={() => {
                      if (application) {
                        void rejectThesisApplication.execute()
                      }
                    }}
                  >
                    {rejectThesisApplication.isLoading ? <Loader /> : 'Reject'}
                  </Button>
                  <Button
                    style={{ width: '20vw' }}
                    color='green'
                    disabled={acceptThesisApplication.isLoading}
                    onClick={() => {
                      if (application) {
                        void acceptThesisApplication.execute()
                      }
                    }}
                  >
                    {acceptThesisApplication.isLoading ? <Loader /> : 'Accept'}
                  </Button>
                </Group>
                <Group align='right'>
                  <Checkbox
                    label='Notify student'
                    checked={notifyStudent}
                    onChange={(event) => setNotifyStudent(event.currentTarget.checked)}
                  />
                </Group>
              </>
            )}
            {accessMode === LegacyApplicationFormAccessMode.STUDENT && (
              <>
                <Stack>
                  <Checkbox
                    mt='md'
                    label='I have read the declaration of consent below and agree to the processing of my data.'
                    {...consentForm.getInputProps('declarationOfConsentAccepted', {
                      type: 'checkbox',
                    })}
                  />
                  <Spoiler
                    maxHeight={0}
                    showLabel={<Text fz='sm'>Show Declaration of Consent</Text>}
                    hideLabel={<Text fz='sm'>Hide</Text>}
                  >
                    <DeclarationOfDataConsent />
                  </Spoiler>
                </Stack>
                <Group>
                  <Button
                    disabled={!form.isValid() || !consentForm.isValid() || !uploads.isValid()}
                    onClick={() => {
                      void (async () => {
                        loadingOverlayHandlers.open()
                        if (uploads.values.examinationReport && uploads.values.cv) {
                          const formData = new FormData()

                          formData.append(
                            'thesisApplication',
                            new Blob([JSON.stringify(form.values)], { type: 'application/json' }),
                          )

                          // TODO: one of this is undefined. Why?
                          formData.append('examinationReport', uploads.values.examinationReport)
                          formData.append('cv', uploads.values.cv)

                          if (uploads.values.bachelorReport) {
                            formData.append('bachelorReport', uploads.values.bachelorReport)
                          }

                          const response = await doRequest('/api/thesis-applications', {
                            method: 'POST',
                            requiresAuth: false,
                            formData,
                          }).catch((err) => {
                            console.error(err)

                            return {ok: false, status: 500, data: undefined}
                          })

                          if (response.ok) {
                            notifications.show({
                              color: 'green',
                              autoClose: 5000,
                              title: 'Success',
                              message: `Your application was successfully submitted!`,
                            })

                            setApplicationSuccessfullySubmitted(true)
                          } else {
                            notifications.show({
                              color: 'red',
                              autoClose: 10000,
                              title: 'Error',
                              message: `Failed to submit the application. Server responded with ${response.status}`,
                            })
                          }
                        }
                      })().then(() => {
                        loadingOverlayHandlers.close()
                      })
                    }}
                  >
                    Submit
                  </Button>
                </Group>
              </>
            )}
          </Stack>
        )}
      </Box>
    </div>
  )
}

export default LegacyThesisApplicationForm
