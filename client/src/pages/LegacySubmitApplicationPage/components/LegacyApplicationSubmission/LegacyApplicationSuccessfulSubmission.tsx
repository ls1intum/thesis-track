import { Card, Text, Title } from '@mantine/core'

interface ApplicationSuccessfulSubmissionProps {
  title: string
  text: string
}

export const LegacyApplicationSuccessfulSubmission = ({
  title,
  text,
}: ApplicationSuccessfulSubmissionProps) => {
  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
    >
      <Card withBorder p='xl'>
        <Title order={5}>{title}</Title>
        <Text c='dimmed'>{text}</Text>
      </Card>
    </div>
  )
}
