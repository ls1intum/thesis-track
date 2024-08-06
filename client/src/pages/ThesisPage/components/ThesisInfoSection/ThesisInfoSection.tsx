import { IThesis } from '../../../../requests/responses/thesis'
import { IThesisAccessPermissions } from '../../types'
import React, { useEffect, useState } from 'react'
import { Accordion, Button, Group, Stack, Title } from '@mantine/core'
import DocumentEditor from '../../../../components/DocumentEditor/DocumentEditor'
import { doRequest } from '../../../../requests/request'
import { notifications } from '@mantine/notifications'
import { showSimpleError, showSimpleSuccess } from '../../../../utils/notification'

interface IThesisInfoSectionProps {
  thesis: IThesis
  access: IThesisAccessPermissions
  onUpdate: (thesis: IThesis) => unknown
}

const ThesisInfoSection = (props: IThesisInfoSectionProps) => {
  const { thesis, access, onUpdate } = props

  const [opened, setOpened] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)

  const [infoText, setInfoText] = useState(thesis.infoText)
  const [abstractText, setAbstractText] = useState(thesis.abstractText)

  useEffect(() => {
    setInfoText(thesis.infoText)
    setAbstractText(thesis.abstractText)
  }, [thesis.thesisId])

  const onSave = async () => {
    setSaving(true)

    try {
      const response = await doRequest<IThesis>(`/v2/theses/${thesis.thesisId}/info`, {
        method: 'PUT',
        requiresAuth: true,
        data: {
          abstractText,
          infoText,
        },
      })

      if (response.ok) {
        showSimpleSuccess('Thesis info updated successfully')

        setEditMode(false)
        onUpdate(response.data)
      } else {
        showSimpleError(`Failed to update thesis ${response.status}`)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Accordion
      variant='separated'
      value={opened ? 'open' : ''}
      onChange={(value) => setOpened(value === 'open')}
    >
      <Accordion.Item value='open'>
        <Accordion.Control>Info</Accordion.Control>
        <Accordion.Panel>
          <Stack>
            <Title order={3}>Abstract</Title>
            <DocumentEditor value={abstractText} editMode={editMode} onChange={setAbstractText} />
            <Title order={3}>Info</Title>
            <DocumentEditor value={infoText} editMode={editMode} onChange={setInfoText} />
            {access.student && !editMode && (
              <Button ml='auto' onClick={() => setEditMode(true)}>
                Edit
              </Button>
            )}
            {editMode && (
              <Group justify='flex-end'>
                <Button
                  loading={saving}
                  variant='danger'
                  onClick={() => {
                    setInfoText(thesis.infoText)
                    setAbstractText(thesis.abstractText)
                    setEditMode(false)
                  }}
                >
                  Cancel
                </Button>
                <Button loading={saving} onClick={onSave}>
                  Save
                </Button>
              </Group>
            )}
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default ThesisInfoSection
