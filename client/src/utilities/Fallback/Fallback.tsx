import { Center, Group, Text, ThemeIcon } from '@mantine/core'
import { IconMoodSadDizzy } from '@tabler/icons-react'
import * as styles from './Fallback.module.scss'

export const Fallback = (): JSX.Element => {
  return (
    <Center className={styles.root}>
      <Group>
        <ThemeIcon className={styles.icon} variant='outline'>
          <IconMoodSadDizzy size={48} />
        </ThemeIcon>
        <Text c='dimmed' fw={500} fz='md'>
          404 Page Not Found
        </Text>
      </Group>
    </Center>
  )
}
