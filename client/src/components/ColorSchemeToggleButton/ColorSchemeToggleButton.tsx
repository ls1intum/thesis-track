import { Moon, Sun } from 'phosphor-react'
import { ActionIcon, useMantineColorScheme } from '@mantine/core'
import React from 'react'
import { BoxProps } from '@mantine/core/lib/core'

const ColorSchemeToggleButton = (props: BoxProps) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()

  return (
    <ActionIcon
      variant='outline'
      color={colorScheme === 'dark' ? 'yellow' : 'pale-purple'}
      onClick={() => toggleColorScheme()}
      title='Toggle color scheme'
      {...props}
    >
      {colorScheme === 'dark' ? <Sun size='1.1rem' /> : <Moon size='1.1rem' />}
    </ActionIcon>
  )
}

export default ColorSchemeToggleButton
