import { Moon, Sun } from 'phosphor-react'
import { ActionIcon, useMantineColorScheme } from '@mantine/core'
import React from 'react'

const ColorSchemeToggleButton = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()

  return (
    <ActionIcon
      variant='outline'
      color={colorScheme === 'dark' ? 'yellow' : 'pale-purple'}
      onClick={() => toggleColorScheme()}
      title='Toggle color scheme'
      ml='auto'
    >
      {colorScheme === 'dark' ? <Sun size='1.1rem' /> : <Moon size='1.1rem' />}
    </ActionIcon>
  )
}

export default ColorSchemeToggleButton
