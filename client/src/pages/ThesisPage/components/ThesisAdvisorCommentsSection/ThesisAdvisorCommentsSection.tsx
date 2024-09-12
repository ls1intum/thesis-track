import { Accordion, Stack } from '@mantine/core'
import { useLoadedThesisContext } from '../../../../contexts/ThesisProvider/hooks'
import ThesisCommentsProvider from '../../../../contexts/ThesisCommentsProvider/ThesisCommentsProvider'
import ThesisCommentsList from '../ThesisCommentsList/ThesisCommentsList'
import ThesisCommentsForm from '../ThesisCommentsForm/ThesisCommentsForm'

const ThesisAdvisorCommentsSection = () => {
  const { thesis, access } = useLoadedThesisContext()

  if (!access.advisor) {
    return null
  }

  return (
    <Accordion variant='separated' defaultValue=''>
      <Accordion.Item value='open'>
        <Accordion.Control>Advisor Comments (Not visible to student)</Accordion.Control>
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
