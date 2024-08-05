import { IThesis } from '../../../../requests/responses/thesis'
import { IThesisAccessPermissions } from '../../types'
import { useState } from 'react'
import { Accordion, Button, Stack, Title } from '@mantine/core'

interface IThesisInfoSectionProps {
  thesis: IThesis
  access: IThesisAccessPermissions
  onUpdate: (thesis: IThesis) => unknown
}

const ThesisInfoSection = (props: IThesisInfoSectionProps) => {
  const { thesis, access, onUpdate } = props

  const [opened, setOpened] = useState(true)
  const [editMode, setEditMode] = useState(false)

  return (
    <Accordion
      variant='contained'
      value={opened ? 'open' : ''}
      onChange={(value) => setOpened(value === 'open')}
    >
      <Accordion.Item value='open'>
        <Accordion.Control>Info</Accordion.Control>
        <Accordion.Panel>
          {editMode ? (
            <Stack></Stack>
          ) : (
            <Stack>
              <Title order={3}>Abstract</Title>
              <Title order={3}>Info</Title>
              {access.student && (
                <Button ml='auto' onClick={() => setEditMode(true)}>
                  Edit
                </Button>
              )}
            </Stack>
          )}
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default ThesisInfoSection
