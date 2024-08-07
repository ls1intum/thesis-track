import React, { ReactNode } from 'react'
import { Stack, Text } from '@mantine/core'

interface ILabeledItemProps {
  label: string
  value: ReactNode
}

const LabeledItem = (props: ILabeledItemProps) => {
  const { label, value } = props

  return (
    <Stack gap='xs'>
      <Text c='dimmed' fz='xs' fw={700}>
        {label}
      </Text>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Text fz='sm' lineClamp={20}>
          {value}
        </Text>
      ) : (
        value
      )}
    </Stack>
  )
}

export default LabeledItem
