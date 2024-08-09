import { Center, Group, Text } from '@mantine/core'
import { SmileySad } from 'phosphor-react'

const NotFound = () => {
  return (
    <Center h='100vh'>
      <Group>
        <SmileySad size={32} />
        <Text c='dimmed' fw={500} fz='md'>
          404 Page Not Found
        </Text>
      </Group>
    </Center>
  )
}

export default NotFound
