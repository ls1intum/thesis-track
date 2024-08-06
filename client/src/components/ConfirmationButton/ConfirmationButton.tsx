import { Button, Group, Modal, Stack, Text, Title } from '@mantine/core'
import { PropsWithChildren, useState } from 'react'
import { ButtonProps } from '@mantine/core/lib/components/Button/Button'

interface IConfirmationButtonProps extends ButtonProps {
  confirmationTitle: string
  confirmationText: string
  onClick: () => unknown
}

const ConfirmationButton = (props: PropsWithChildren<IConfirmationButtonProps>) => {
  const { confirmationTitle, confirmationText, children, onClick, ...buttonProps } = props

  const [opened, setOpened] = useState(false)

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={<Title order={2}>{confirmationTitle}</Title>}
      >
        <Stack>
          <Text>{confirmationText}</Text>
          <Group grow>
            <Button variant='outline' color='red' onClick={() => setOpened(false)}>
              Cancel
            </Button>
            <Button
              variant='outline'
              color='green'
              onClick={() => {
                setOpened(false)
                onClick()
              }}
            >
              Confirm
            </Button>
          </Group>
        </Stack>
      </Modal>
      <Button {...buttonProps} onClick={() => setOpened(true)}>
        {children}
      </Button>
    </>
  )
}

export default ConfirmationButton
