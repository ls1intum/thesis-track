import { IThesis } from '../../../../requests/responses/thesis'
import React, { useEffect, useState } from 'react'
import { Accordion, Button, Flex, Grid, Group, Stack } from '@mantine/core'
import DocumentEditor from '../../../../components/DocumentEditor/DocumentEditor'
import { doRequest } from '../../../../requests/request'
import {
  useLoadedThesisContext,
  useThesisUpdateAction,
} from '../../../../providers/ThesisProvider/hooks'
import { Link } from 'react-router-dom'
import { ApiError } from '../../../../requests/handler'
import DownloadAllFilesButton from './components/DownloadAllFilesButton/DownloadAllFilesButton'

const ThesisInfoSection = () => {
  const { thesis, access } = useLoadedThesisContext()

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
      throw new ApiError(response)
    }
  }, 'Thesis info updated successfully')

  return (
    <Accordion variant='separated' defaultValue='open'>
      <Accordion.Item value='open'>
        <Accordion.Control>Info</Accordion.Control>
        <Accordion.Panel>
          <Stack>
            <DocumentEditor
              label='Abstract'
              value={abstractText}
              editMode={editMode}
              onChange={(e) => setAbstractText(e.target.value)}
            />
            <DocumentEditor
              label='Additional Information (Important links, repositories etc.)'
              value={infoText}
              editMode={editMode}
              onChange={(e) => setInfoText(e.target.value)}
            />
            <Grid>
              <Grid.Col span={{ md: 6 }}>
                {access.advisor && thesis.applicationId && (
                  <Button
                    component={Link}
                    variant='outline'
                    to={`/applications/${thesis.applicationId}`}
                  >
                    View Student Application
                  </Button>
                )}
              </Grid.Col>
              <Grid.Col span={{ md: 6 }}>
                <Flex justify='flex-end'>
                  {access.student && !editMode && (
                    <Group>
                      <DownloadAllFilesButton />
                      <Button ml='auto' onClick={() => setEditMode(true)}>
                        Edit
                      </Button>
                    </Group>
                  )}
                  {editMode && (
                    <Group>
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
                </Flex>
              </Grid.Col>
            </Grid>
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default ThesisInfoSection
