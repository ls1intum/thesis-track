import { Center, Group, Text, ThemeIcon } from '@mantine/core'
import * as styles from './NotFoundPage.module.scss'
import { SmileySad } from 'phosphor-react'
import { usePageTitle } from '../../hooks/theme'

const NotFoundPage = () => {
  usePageTitle('Not Found')

  return (
    <Center className={styles.root}>
      <Group>
        <ThemeIcon className={styles.icon} variant='outline'>
          <SmileySad size={48} />
        </ThemeIcon>
        <Text c='dimmed' fw={500} fz='md'>
          404 Page Not Found
        </Text>
      </Group>
    </Center>
  )
}

export default NotFoundPage
