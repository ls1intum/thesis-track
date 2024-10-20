import React from 'react'
import ThesesFilters from '../../components/ThesesFilters/ThesesFilters'
import ThesesProvider from '../../providers/ThesesProvider/ThesesProvider'
import { usePageTitle } from '../../hooks/theme'
import ThesesGanttChart from '../../components/ThesesGanttChart/ThesesGanttChart'
import { Stack, Title } from '@mantine/core'
import { ThesisState } from '../../requests/responses/thesis'

const ThesisOverviewPage = () => {
  usePageTitle('Theses Overview')

  return (
    <ThesesProvider
      fetchAll={true}
      defaultStates={[
        ThesisState.PROPOSAL,
        ThesisState.WRITING,
        ThesisState.SUBMITTED,
        ThesisState.ASSESSED,
        ThesisState.GRADED,
      ]}
      limit={200}
    >
      <Stack>
        <Title>Theses Overview</Title>
        <ThesesFilters />
        <ThesesGanttChart />
      </Stack>
    </ThesesProvider>
  )
}

export default ThesisOverviewPage
