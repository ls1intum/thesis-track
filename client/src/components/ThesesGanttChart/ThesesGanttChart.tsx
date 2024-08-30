import { useThesesContext } from '../../contexts/ThesesProvider/hooks'
import GanttChart, { IGanttChartDataElement } from '../GanttChart/GanttChart'
import { useMemo, useState } from 'react'
import { formatDate, formatPresentationType, formatUser } from '../../utils/format'
import { ThesisStateColor } from '../../config/colors'
import ThesisPreviewModal from '../ThesisPreviewModal/ThesisPreviewModal'
import { IThesis, ThesisState } from '../../requests/responses/thesis'
import { Center, Group, Stack, Text } from '@mantine/core'
import ThesisStateBadge from '../ThesisStateBadge/ThesisStateBadge'
import { Presentation } from 'phosphor-react'
import { arrayUnique } from '../../utils/array'
import ThesisData from '../ThesisData/ThesisData'
import AvatarUserList from '../AvatarUserList/AvatarUserList'

const ThesesGanttChart = () => {
  const { theses } = useThesesContext()

  const [openedThesis, setOpenedThesis] = useState<IThesis>()

  const currentTime = useMemo(() => Date.now(), [])

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

      result.push({
        id: thesis.thesisId,
        groupId: thesis.advisors[0].userId,
        groupName: formatUser(thesis.advisors[0]),
        columns: [
          <AvatarUserList
            key='student'
            users={thesis.students}
            withUniversityId={false}
            size='xs'
          />,
          <Text key='title' size='xs' truncate>
            {thesis.title}
          </Text>,
        ],
        timeline: thesis.states.map((state) => ({
          id: state.state,
          startDate: new Date(state.startedAt),
          endDate: getAdjustedEndDate(
            state.state,
            new Date(state.startedAt),
            new Date(state.endedAt),
          ),
          color: ThesisStateColor[state.state],
        })),
        events: thesis.presentations.map((presentation) => ({
          id: presentation.presentationId,
          icon: <Presentation />,
          time: new Date(presentation.scheduledAt),
        })),
      })
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
        columns={[
          { label: 'Student', width: '10rem' },
          { label: 'Title', width: '15rem' },
        ]}
        data={data}
        minRange={[currentTime - 1000 * 3600 * 24 * 365 * 2, currentTime + 1000 * 3600 * 24 * 365]}
        itemPopover={(item, timeline, event) => {
          const thesis = theses?.content.find((row) => row.thesisId === item.id)

          if (!thesis) {
            return null
          }

          const presentation = thesis.presentations.find((row) => row.presentationId === event?.id)

          return (
            <Stack gap='md'>
              {timeline && (
                <Group>
                  <Text fw='bold' fz='sm'>
                    Dates for state:
                  </Text>
                  <ThesisStateBadge state={timeline.id as ThesisState} />
                  <Text fw='bold' fz='sm'>
                    {formatDate(timeline.startDate)} - {formatDate(timeline.endDate)}
                  </Text>
                </Group>
              )}
              {presentation && (
                <Text fw='bold' fz='sm'>
                  {formatPresentationType(presentation.type)} Presentation scheduled at{' '}
                  {formatDate(presentation.scheduledAt)}
                </Text>
              )}
              <ThesisData thesis={thesis} additionalInformation={['title', 'state', 'keywords']} />
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
