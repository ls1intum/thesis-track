import { useThesesContext } from '../../contexts/ThesesProvider/hooks'
import GanttChart, { IGanttChartDataElement } from '../GanttChart/GanttChart'
import { useMemo, useState } from 'react'
import { formatDate, formatUser } from '../../utils/format'
import { ThesisStateColor } from '../../config/colors'
import ThesisPreviewModal from '../ThesisPreviewModal/ThesisPreviewModal'
import { IThesis, ThesisState } from '../../requests/responses/thesis'
import { Center, Group, Stack, Text } from '@mantine/core'
import LabeledItem from '../LabeledItem/LabeledItem'
import ThesisStateBadge from '../ThesisStateBadge/ThesisStateBadge'
import { Presentation } from 'phosphor-react'
import { arrayUnique } from '../../utils/array'

const ThesesGanttChart = () => {
  const { theses } = useThesesContext()

  const [openedThesis, setOpenedThesis] = useState<IThesis>()

  const data = useMemo<IGanttChartDataElement[] | undefined>(() => {
    if (!theses) {
      return undefined
    }

    const result: IGanttChartDataElement[] = []

    for (const thesis of theses.content) {
      const getAdjustedEndDate = (state: ThesisState, startDate: Date, endDate: Date) => {
        if (state === ThesisState.PROPOSAL && state === thesis.state) {
          // Proposal phase should be at least 4 weeks long if not completed yet
          return new Date(Math.max(endDate.getTime(), startDate.getTime() + 3600 * 24 * 28 * 1000))
        }

        if (state === ThesisState.WRITING && state === thesis.state && thesis.endDate) {
          // Writing phase should end at endDate if not completed yet
          return new Date(thesis.endDate)
        }

        return endDate
      }

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
            endDate: getAdjustedEndDate(
              state.state,
              new Date(state.startedAt),
              new Date(state.endedAt),
            ),
            color: ThesisStateColor[state.state],
          })),
          events: thesis.presentations.map((presentation) => ({
            icon: <Presentation />,
            time: new Date(presentation.scheduledAt),
          })),
        })),
      )
    }

    return result
  }, [theses])

  const visibleStates: ThesisState[] = theses
    ? arrayUnique<ThesisState>([
        ...theses.content.reduce<ThesisState[]>(
          (prev, curr) => [
            ...prev,
            ...curr.states.filter((row) => row.startedAt !== row.endedAt).map((row) => row.state),
          ],
          [],
        ),
      ])
    : []

  return (
    <div>
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
      <Center mt='md'>
        <Group>
          <Text>Legend:</Text>
          {visibleStates.map((state) => (
            <ThesisStateBadge key={state} state={state} />
          ))}
        </Group>
      </Center>
      <ThesisPreviewModal
        opened={!!openedThesis}
        onClose={() => setOpenedThesis(undefined)}
        thesis={openedThesis}
      />
    </div>
  )
}

export default ThesesGanttChart
