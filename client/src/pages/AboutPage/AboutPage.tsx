import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import { Anchor, Center, Image, List, Stack, Text, Title } from '@mantine/core'
import { Link } from 'react-router-dom'
import flowchart from './flowchart.svg'
import { CaretLeft } from 'phosphor-react'

const AboutPage = () => {
  return (
    <ContentContainer size='md'>
      <Stack>
        <Anchor component={Link} c='dimmed' fz='xs' to='/'>
          <CaretLeft size={10} /> Back
        </Anchor>
        <Title>Thesis Track</Title>
        <Text>
          Thesis Track is an{' '}
          <Anchor href='https://github.com/ls1intum/thesis-track' target='_blank' rel='noreferrer'>
            open source
          </Anchor>{' '}
          web application that represents the complete thesis lifecycle of theses applied for and
          supervised at the chair.
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
    </ContentContainer>
  )
}

export default AboutPage
