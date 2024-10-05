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
          ThesisTrack is an{' '}
          <Anchor href='https://github.com/ls1intum/thesis-track' target='_blank' rel='noreferrer'>
            open source
          </Anchor>{' '}
          web application that integrates the complete thesis lifecycle for theses supervised at a
          chair. It should help advisors and supervisors to save time on reoccurring processes.
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
        <Center>
          <Image src={flowchart} style={{ maxWidth: '600px' }} />
        </Center>
      </Stack>
    </PublicArea>
  )
}

export default AboutPage
