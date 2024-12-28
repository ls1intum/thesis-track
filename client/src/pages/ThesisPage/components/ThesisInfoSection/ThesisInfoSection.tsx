import { IThesis } from '../../../../requests/responses/thesis'
import React, { useEffect, useState } from 'react'
import { Accordion, Button, Flex, Grid, Group, Stack, TextInput } from '@mantine/core'
import DocumentEditor from '../../../../components/DocumentEditor/DocumentEditor'
import { doRequest } from '../../../../requests/request'
import {
  useLoadedThesisContext,
  useThesisUpdateAction,
} from '../../../../providers/ThesisProvider/hooks'
import { Link } from 'react-router'
import { ApiError } from '../../../../requests/handler'
import DownloadAllFilesButton from './components/DownloadAllFilesButton/DownloadAllFilesButton'
import { isThesisClosed } from '../../../../utils/thesis'
import { GLOBAL_CONFIG } from '../../../../config/global'
import { formatLanguage } from '../../../../utils/format'
import LabeledItem from '../../../../components/LabeledItem/LabeledItem'

const ThesisInfoSection = () => {
  const { thesis, access } = useLoadedThesisContext()

  const [editMode, setEditMode] = useState(false)

  const [infoText, setInfoText] = useState(thesis.infoText)
  const [abstractText, setAbstractText] = useState(thesis.abstractText)
  const [titles, setTitles] = useState<Record<string, string>>({})

  useEffect(() => {
    setInfoText(thesis.infoText)
    setAbstractText(thesis.abstractText)
    setTitles({
      ...thesis.metadata.titles,
      [thesis.language]: thesis.title,
    })
  }, [thesis.infoText, thesis.abstractText, thesis.metadata, thesis.title, thesis.language])

  const [saving, onSave] = useThesisUpdateAction(async () => {
    const response = await doRequest<IThesis>(`/v2/theses/${thesis.thesisId}/info`, {
      method: 'PUT',
      requiresAuth: true,
      data: {
        abstractText,
        infoText,
        primaryTitle: titles[thesis.language],
        secondaryTitles: titles,
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
            {editMode ? (
              <Stack>
                {Object.keys(GLOBAL_CONFIG.languages).map((language) => (
                  <TextInput
                    key={`input-${language}`}
                    label={`${formatLanguage(language)} Title`}
                    value={titles[language] || ''}
                    onChange={(e) => setTitles((prev) => ({ ...prev, [language]: e.target.value }))}
                  />
                ))}
              </Stack>
            ) : (
              <Stack>
                {Object.keys(GLOBAL_CONFIG.languages).map((language) => (
                  <LabeledItem
                    key={`label-${language}`}
                    label={`${formatLanguage(language)} Title`}
                    value={titles[language] || 'No Title'}
                    copyText={titles[language]}
                  />
                ))}
              </Stack>
            )}
            <DocumentEditor
              label='Abstract'
              value={abstractText}
              editMode={editMode}
              onChange={(e) => setAbstractText(e.target.value)}
              maxLength={2000}
            />
            <DocumentEditor
              label='Additional Information (Important links, repositories etc.)'
              value={infoText}
              editMode={editMode}
              onChange={(e) => setInfoText(e.target.value)}
              maxLength={2000}
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
                  <Group>
                    {!editMode && <DownloadAllFilesButton />}
                    {access.student && !editMode && !isThesisClosed(thesis) && (
                      <Button ml='auto' onClick={() => setEditMode(true)}>
                        Edit
                      </Button>
                    )}
                  </Group>
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
