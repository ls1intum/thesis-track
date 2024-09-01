import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import { Anchor, Button, List, Stack, Text, Title } from '@mantine/core'
import { Link } from 'react-router-dom'

const AboutPage = () => {
  return (
    <ContentContainer size='md'>
      <Stack>
        <Title>About</Title>
        <Text>
          Thesis Track is a web application that represents the complete thesis lifecycle of theses
          applied for and supervised at the chair.
        </Text>
        <Text>
          Thesis Track is{' '}
          <Anchor href='https://github.com/ls1intum/thesis-track' target='_blank' rel='noreferrer'>
            open source
          </Anchor>
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
        <Button component={Link} to='/' ml='auto'>
          Back to Landing Page
        </Button>
      </Stack>
    </ContentContainer>
  )
}

export default AboutPage
