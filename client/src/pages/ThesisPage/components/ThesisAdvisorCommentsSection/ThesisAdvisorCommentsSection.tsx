import { Accordion, Badge, Group, Stack, Text } from '@mantine/core'
import { useLoadedThesisContext } from '../../../../providers/ThesisProvider/hooks'
import ThesisCommentsProvider from '../../../../providers/ThesisCommentsProvider/ThesisCommentsProvider'
import ThesisCommentsList from '../../../../components/ThesisCommentsList/ThesisCommentsList'
import ThesisCommentsForm from '../../../../components/ThesisCommentsForm/ThesisCommentsForm'

const ThesisAdvisorCommentsSection = () => {
  const { thesis, access } = useLoadedThesisContext()

  if (!access.advisor) {
    return null
  }

  return (
    <Accordion variant='separated' defaultValue=''>
      <Accordion.Item value='open'>
        <Accordion.Control>
          <Group gap='xs'>
            <Text>Advisor Comments</Text>
            <Badge color='grey'>Not visible to student</Badge>
          </Group>
        </Accordion.Control>
        <Accordion.Panel>
          <Stack>
            <ThesisCommentsProvider thesis={thesis} commentType='ADVISOR'>
              <ThesisCommentsList />
              <ThesisCommentsForm />
            </ThesisCommentsProvider>
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default ThesisAdvisorCommentsSection
