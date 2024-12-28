import { Accordion, Button, Grid, Group, NumberInput, Paper, Stack } from '@mantine/core'
import { IThesis } from '../../../../requests/responses/thesis'
import LabeledItem from '../../../../components/LabeledItem/LabeledItem'
import { GLOBAL_CONFIG } from '../../../../config/global'
import { useHighlightedBackgroundColor } from '../../../../hooks/theme'
import {
  useLoadedThesisContext,
  useThesisUpdateAction,
} from '../../../../providers/ThesisProvider/hooks'
import { formatUser } from '../../../../utils/format'
import { useEffect, useState } from 'react'
import { doRequest } from '../../../../requests/request'
import { ApiError } from '../../../../requests/handler'

const ThesisStudentInfoSection = () => {
  const { thesis, access } = useLoadedThesisContext()

  const [credits, setCredits] = useState(thesis.metadata.credits)

  useEffect(() => {
    setCredits(thesis.metadata.credits)
  }, [thesis.metadata.credits])

  const studentBackgroundColor = useHighlightedBackgroundColor(false)

  const [updating, onUpdate] = useThesisUpdateAction(async () => {
    const response = await doRequest<IThesis>(`/v2/theses/${thesis.thesisId}/credits`, {
      method: 'PUT',
      data: {
        credits,
      },
      requiresAuth: true,
    })

    if (response.ok) {
      return response.data
    } else {
      throw new ApiError(response)
    }
  }, 'Credits updated successfully')

  if (!access.advisor) {
    return null
  }

  const users = [
    ...thesis.students.map((row) => ({
      type: 'student',
      data: row,
    })),
    ...thesis.advisors.map((row) => ({
      type: 'advisor',
      data: row,
    })),
  ]

  return (
    <Accordion variant='separated' defaultValue=''>
      <Accordion.Item value='open'>
        <Accordion.Control>Involved Persons</Accordion.Control>
        <Accordion.Panel>
          <Stack gap='sm'>
            {users.map((user) => (
              <Paper
                key={`${user.type}-${user.data.userId}`}
                p='md'
                radius='sm'
                style={{ backgroundColor: studentBackgroundColor }}
              >
                <Grid>
                  <Grid.Col span={{ md: 2 }}>
                    <LabeledItem
                      label={user.type === 'student' ? 'Student' : 'Advisor'}
                      value={formatUser(user.data)}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ md: 2 }}>
                    <LabeledItem
                      label='University ID'
                      value={user.data.universityId}
                      copyText={user.data.universityId}
                    />
                  </Grid.Col>
                  {user.data.matriculationNumber && (
                    <Grid.Col span={{ md: 2 }}>
                      <LabeledItem
                        label='Matriculation Number'
                        value={user.data.matriculationNumber}
                        copyText={user.data.matriculationNumber || undefined}
                      />
                    </Grid.Col>
                  )}
                  {user.data.email && (
                    <Grid.Col span={{ md: 2 }}>
                      <LabeledItem
                        label='E-Mail'
                        value={user.data.email}
                        copyText={user.data.email || undefined}
                      />
                    </Grid.Col>
                  )}
                  {user.data.studyProgram && user.data.studyDegree && (
                    <Grid.Col span={{ md: 2 }}>
                      <LabeledItem
                        label='Study Degree'
                        value={`${
                          GLOBAL_CONFIG.study_programs[user.data.studyProgram || ''] ??
                          user.data.studyProgram
                        } ${
                          GLOBAL_CONFIG.study_degrees[user.data.studyDegree || ''] ??
                          user.data.studyDegree
                        } `}
                      />
                    </Grid.Col>
                  )}
                  {user.data.customData &&
                    Object.entries(user.data.customData).map(([key, value]) => (
                      <Grid.Col key={key} span={{ md: 6 }}>
                        <LabeledItem
                          label={GLOBAL_CONFIG.custom_data[key]?.label ?? key}
                          value={value}
                        />
                      </Grid.Col>
                    ))}
                  {user.type === 'student' && (
                    <Grid.Col span={{ md: 6 }}>
                      <NumberInput
                        label='Credits for Thesis'
                        min={1}
                        value={credits[user.data.userId]}
                        onChange={(value) =>
                          setCredits((prev) => {
                            if (value) {
                              return { ...prev, [user.data.userId]: +value }
                            } else {
                              delete prev[user.data.userId]

                              return { ...prev }
                            }
                          })
                        }
                        inputContainer={(children) => (
                          <Group>
                            {children}
                            <Button loading={updating} onClick={onUpdate}>
                              Save
                            </Button>
                          </Group>
                        )}
                      />
                    </Grid.Col>
                  )}
                </Grid>
              </Paper>
            ))}
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default ThesisStudentInfoSection
