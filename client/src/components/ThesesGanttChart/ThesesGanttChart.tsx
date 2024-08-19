import { useThesesContext } from '../../contexts/ThesesProvider/hooks'
import GanttChart, { IGanttChartDataElement } from '../GanttChart/GanttChart'
import { useMemo, useState } from 'react'
import { formatDate, formatUser } from '../../utils/format'
import { ThesisStateColor } from '../../config/colors'
import ThesisPreviewModal from '../ThesisPreviewModal/ThesisPreviewModal'
import { IThesis } from '../../requests/responses/thesis'
import { Group, Stack } from '@mantine/core'
import LabeledItem from '../LabeledItem/LabeledItem'
import ThesisStateBadge from '../ThesisStateBadge/ThesisStateBadge'

const ThesesGanttChart = () => {
  const { theses } = useThesesContext()

  const [openedThesis, setOpenedThesis] = useState<IThesis>()

  const data = useMemo<IGanttChartDataElement[] | undefined>(() => {
    if (!theses) {
      return undefined
    }

    const result: IGanttChartDataElement[] = []

    for (const thesis of theses.content) {
      result.push(
        ...thesis.advisors.map((advisor) => ({
          id: thesis.thesisId,
          groupId: advisor.userId,
          groupName: formatUser(advisor),
          columns: [
            thesis.title,
            formatDate(thesis.startDate, { withTime: false }),
            formatDate(thesis.endDate, { withTime: false }),
          ],
          timeline: thesis.states.map((state) => ({
            startDate: new Date(state.startedAt),
            endDate: new Date(state.endedAt),
            color: ThesisStateColor[state.state],
          })),
        })),
      )
    }

    return result
  }, [theses])

  return (
    <>
      <GanttChart
        columns={['Title', 'Target Start', 'Target End']}
        data={data}
        itemPopover={(item) => {
          const thesis = theses?.content.find((row) => row.thesisId === item.id)

          if (!thesis) {
            return null
          }

          return (
            <Stack gap='md'>
              <LabeledItem label='Thesis Title' value={thesis.title} />
              <Group grow>
                <LabeledItem
                  label='Supervisor'
                  value={thesis.supervisors.map((user) => formatUser(user)).join(', ')}
                />
                <LabeledItem
                  label='Advisor'
                  value={thesis.advisors.map((user) => formatUser(user)).join(', ')}
                />
                <LabeledItem
                  label='Student'
                  value={thesis.students.map((user) => formatUser(user)).join(', ')}
                />
              </Group>
              <Group grow>
                {thesis.startDate && (
                  <LabeledItem
                    label='Start Date'
                    value={formatDate(thesis.startDate, { withTime: false })}
                  />
                )}
                {thesis.endDate && (
                  <LabeledItem
                    label='End Date'
                    value={formatDate(thesis.endDate, { withTime: false })}
                  />
                )}
                <LabeledItem label='State' value={<ThesisStateBadge state={thesis.state} />} />
              </Group>
            </Stack>
          )
        }}
        onItemClick={(item) =>
          setOpenedThesis(theses?.content.find((thesis) => thesis.thesisId === item.id))
        }
      />
      <ThesisPreviewModal
        opened={!!openedThesis}
        onClose={() => setOpenedThesis(undefined)}
        thesis={openedThesis}
      />
    </>
  )
}

export default ThesesGanttChart
