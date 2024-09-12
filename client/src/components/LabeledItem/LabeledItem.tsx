import React, { ReactNode } from 'react'
import { ActionIcon, CopyButton, Group, Input, Text, Tooltip } from '@mantine/core'
import { Check, Copy } from 'phosphor-react'

interface ILabeledItemProps {
  label: string
  value: ReactNode
  copyText?: string | undefined
}

const LabeledItem = (props: ILabeledItemProps) => {
  const { label, value, copyText } = props

  return (
    <Input.Wrapper label={label}>
      <Group gap={4} wrap='nowrap'>
        {typeof value === 'string' || typeof value === 'number' ? (
          <Text fz='sm' truncate>
            {value}
          </Text>
        ) : (
          <div style={{ flexGrow: 1 }}>{value}</div>
        )}
        {copyText && (
          <CopyButton value={copyText}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position='right'>
                <ActionIcon color={copied ? 'teal' : 'gray'} variant='subtle' onClick={copy}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        )}
      </Group>
    </Input.Wrapper>
  )
}

export default LabeledItem
