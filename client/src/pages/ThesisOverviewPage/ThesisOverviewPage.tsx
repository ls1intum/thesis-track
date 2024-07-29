import React from 'react'
import { Container, Space } from '@mantine/core'
import chartData from './mock/chart-data.json'
import CustomThesisProgressChart from './components/CustomThesisProgressChart/CustomThesisProgressChart'
import ThesisProgressFilter from './components/ThesisProgressFilter/ThesisProgressFilter'
import ThesisOverviewChartProvider from './components/ThesisOverviewChartProvider/ThesisOverviewChartProvider'
import { IThesisProgressChartDataElement } from './types/chart'
import { usePageTitle } from '../../hooks/theme'

const ThesisOverviewPage = () => {
  usePageTitle('Theses Overview')

  return (
    <Container size='xl'>
      <ThesisOverviewChartProvider
        mockData={{
          thesisData: chartData.data as IThesisProgressChartDataElement[],
          advisors: chartData.advisors,
        }}
      >
        <center>
          <h1>Thesis Overview Chart</h1>
        </center>
        <ThesisProgressFilter />
        <Space h='md' />
        <div>
          <CustomThesisProgressChart width='100%' height={700} />
        </div>
        <Space h='md' />
      </ThesisOverviewChartProvider>
    </Container>
  )
}

export default ThesisOverviewPage
