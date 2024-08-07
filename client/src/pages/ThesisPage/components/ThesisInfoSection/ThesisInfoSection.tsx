import { IThesis } from '../../../../requests/responses/thesis'
import React, { useEffect, useState } from 'react'
import { Accordion, Button, Group, Stack, Title } from '@mantine/core'
import DocumentEditor from '../../../../components/DocumentEditor/DocumentEditor'
import { doRequest } from '../../../../requests/request'
import {
  useLoadedThesisContext,
  useThesisUpdateAction,
} from '../../../../contexts/ThesisProvider/hooks'
import { useNavigate } from 'react-router-dom'

const ThesisInfoSection = () => {
  const { thesis, access } = useLoadedThesisContext()

  const navigate = useNavigate()

  const [opened, setOpened] = useState(true)
  const [editMode, setEditMode] = useState(false)

  const [infoText, setInfoText] = useState(thesis.infoText)
  const [abstractText, setAbstractText] = useState(thesis.abstractText)

  useEffect(() => {
    setInfoText(thesis.infoText)
    setAbstractText(thesis.abstractText)
  }, [thesis.infoText, thesis.abstractText])

  const [saving, onSave] = useThesisUpdateAction(async () => {
    const response = await doRequest<IThesis>(`/v2/theses/${thesis.thesisId}/info`, {
      method: 'PUT',
      requiresAuth: true,
      data: {
        abstractText,
        infoText,
      },
    })

    if (response.ok) {
      setEditMode(false)

      return response.data
    } else {
      throw new Error(`Failed to update thesis ${response.status}`)
    }
  }, 'Thesis info updated successfully')

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
            <Group>
              {access.advisor && thesis.applicationId && (
                <Button
                  variant='outline'
                  onClick={() =>
                    navigate(`/management/thesis-applications/${thesis.applicationId}`)
                  }
                >
                  View Student Application
                </Button>
              )}
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
            </Group>
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default ThesisInfoSection
