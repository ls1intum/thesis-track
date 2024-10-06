import { useNavigate, useParams } from 'react-router-dom'
import { useTopic } from '../../hooks/fetcher'
import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import { Card, Center, Stack, Stepper, Text, Title } from '@mantine/core'
import { useEffect, useState } from 'react'
import SelectTopicStep from './components/SelectTopicStep/SelectTopicStep'
import StudentInformationStep from './components/StudentInformationStep/StudentInformationStep'
import MotivationStep from './components/MotivationStep/MotivationStep'
import TopicsProvider from '../../contexts/TopicsProvider/TopicsProvider'
import { IApplication } from '../../requests/responses/application'
import { doRequest } from '../../requests/request'
import { usePageTitle } from '../../hooks/theme'

const ReplaceApplicationPage = () => {
  const { topicId, applicationId } = useParams<{ topicId: string; applicationId: string }>()

  usePageTitle('Submit Application')

  const [application, setApplication] = useState<IApplication>()

  useEffect(() => {
    setApplication(undefined)

    if (applicationId) {
      return doRequest<IApplication>(
        `/v2/applications/${applicationId}`,
        {
          method: 'GET',
          requiresAuth: true,
        },
        (res) => {
          if (res.ok) {
            setApplication(res.data)
          }
        },
      )
    }
  }, [applicationId])

  const navigate = useNavigate()
  const topic = useTopic(topicId)

  const [step, setStep] = useState(0)

  const updateStep = (value: number) => {
    if (value > step) {
      return
    }

    if (value === 0 && topicId) {
      navigate(`/submit-application`, { replace: true })
    }

    window.scrollTo(0, 0)
    setStep(value)
  }

  return (
    <Stack>
      <Title>{applicationId ? 'Edit Application' : 'Submit Application'}</Title>
      <Stepper active={Math.max(step, topicId || applicationId ? 1 : 0)} onStepClick={updateStep}>
        <Stepper.Step label='First Step' description='Select Topic'>
          <TopicsProvider limit={100}>
            <SelectTopicStep
              onComplete={(x) => {
                navigate(`/submit-application/${x?.topicId || ''}`, { replace: true })
                setStep(1)
              }}
            />
          </TopicsProvider>
        </Stepper.Step>
        <Stepper.Step label='Second step' description='Update Information'>
          <StudentInformationStep onComplete={() => setStep(2)} />
        </Stepper.Step>
        <Stepper.Step label='Final step' description='Submit your Application'>
          <MotivationStep
            onComplete={() => setStep(3)}
            topic={topic || undefined}
            application={application}
          />
        </Stepper.Step>
        <Stepper.Completed>
          <Center style={{ height: '50vh' }}>
            <Card withBorder p='xl'>
              <Stack gap='sm'>
                <Text ta='center'>
                  {application
                    ? 'Your application was successfully updated!'
                    : 'Your application was successfully submitted!'}
                </Text>
                <Text ta='center' size='sm' c='muted'>
                  We will contact you as soon as we have reviewed your application.
                </Text>
              </Stack>
            </Card>
          </Center>
        </Stepper.Completed>
      </Stepper>
    </Stack>
  )
}

export default ReplaceApplicationPage
