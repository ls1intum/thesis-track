import { Anchor, Center, Image, List, Stack, Text, Title } from '@mantine/core'
import flowchart from './flowchart.svg'
import { usePageTitle } from '../../hooks/theme'
import PublicArea from '../../app/layout/PublicArea/PublicArea'
import { GLOBAL_CONFIG } from '../../config/global'

const AboutPage = () => {
  usePageTitle('About')

  return (
    <PublicArea withBackButton={true}>
      <Stack>
        <Title>ThesisTrack</Title>
        <Text>
          ThesisTrack addresses inefficient manual thesis management processes at large universities
          through a web-based platform. The system digitizes the entire lifecycle from student
          applications to final grading, serving three key stakeholders: supervisors (professors),
          advisors (doctoral candidates), and students. Key features include:
        </Text>
        <List>
          <List.Item>
            A structured application system allowing students to apply directly for specific thesis
            topics
          </List.Item>
          <List.Item>
            Centralized document management for proposals, theses, and presentations
          </List.Item>
          <List.Item>Built-in feedback mechanisms for proposal and thesis review</List.Item>
          <List.Item>
            A Gantt chart overview showing timelines and progress across multiple theses
          </List.Item>
          <List.Item>
            Role-based access control with specific permissions for students, advisors, and
            supervisors
          </List.Item>
          <List.Item>Automated notifications for important milestones and updates</List.Item>
        </List>
        <Title order={3}>Project Managers</Title>
        <List>
          <List.Item>
            <Anchor href='https://ase.cit.tum.de/people/krusche/' target='_blank' rel='noreferrer'>
              Stephan Krusche
            </Anchor>
          </List.Item>
        </List>
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
        <Title order={3}>Git Information</Title>
        <List>
          <List.Item>
            Branch: <b>{GLOBAL_CONFIG.git.branch}</b>
          </List.Item>
          <List.Item>
            Commit: <b>{GLOBAL_CONFIG.git.commit}</b>
          </List.Item>
        </List>
      </Stack>
    </PublicArea>
  )
}

export default AboutPage
