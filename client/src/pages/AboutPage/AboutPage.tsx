import { Anchor, Center, Image, List, Stack, Text, Title } from '@mantine/core'
import flowchart from './flowchart.svg'
import { usePageTitle } from '../../hooks/theme'
import PublicArea from '../../app/layout/PublicArea/PublicArea'

const AboutPage = () => {
  usePageTitle('About')

  return (
    <PublicArea withBackButton={true}>
      <Stack>
        <Title>ThesisTrack</Title>
        <Text>
          ThesisTrack is a web-based thesis management system designed to streamline the thesis
          process in academic institutions by integrating essential stages into a single platform.
          Developed to address challenges in managing large volumes of theses, it facilitates
          seamless interactions between students, advisors, and supervisors. Key features include a
          centralized application process, guided workflows for thesis writing, automated
          notifications, and a comprehensive Gantt chart for tracking progress. By consolidating
          communication, feedback, and file management, ThesisTrack enhances transparency, reduces
          administrative burdens, and fosters efficient thesis supervision and assessment.
        </Text>
        <Title order={3}>Contributors</Title>
        <List>
          <List.Item>
            <Anchor href='https://github.com/fabian-emilius' target='_blank' rel='noreferrer'>
              Fabian Emilius
            </Anchor>
          </List.Item>
          <List.Item>
            <Anchor href='https://github.com/airelawaleria' target='_blank' rel='noreferrer'>
              Valeryia Andraichuk
            </Anchor>
          </List.Item>
        </List>
        <Title order={3}>Features</Title>
        <Text>
          The following flowchart diagram provides a visual overview of the thesis processes
          implemented in ThesisTrack. These diagram illustrates the step-by-step workflows involved,
          from thesis topic selection and application submission to the final grading and completion
          stages. It highlights key actions, decision points, and interactions between students,
          advisors, and supervisors, clarifying how tasks are sequenced and managed within the
          system. These flowcharts offer a quick reference for understanding how each role engages
          in the thesis process, ensuring transparency and consistency in task progression and
          responsibilities across different stages.
        </Text>
        <Center>
          <Image src={flowchart} style={{ maxWidth: '600px' }} />
        </Center>
      </Stack>
    </PublicArea>
  )
}

export default AboutPage
