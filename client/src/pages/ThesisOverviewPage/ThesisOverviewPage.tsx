import React from 'react'
import EChartsThesisProgressChart from './components/EChartsThesisProgressChart/EChartsThesisProgressChart'
import { Container, Space } from '@mantine/core'
import chartData from './mock/chart-data.json'
import { useParams } from 'react-router-dom'
import CustomThesisProgressChart from './components/CustomThesisProgressChart/CustomThesisProgressChart'
import ThesisProgressFilter from './components/ThesisProgressFilter/ThesisProgressFilter'
import ThesisOverviewChartProvider from './components/ThesisOverviewChartProvider/ThesisOverviewChartProvider'
import { IThesisProgressChartDataElement } from './types/chart'

const ThesisOverviewPage = () => {
  const { variant } = useParams<{ variant: string }>()

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
          {variant === 'custom' ? (
            <CustomThesisProgressChart width='100%' height={700} />
          ) : (
            <EChartsThesisProgressChart width='100%' height={700} />
          )}
        </div>
        <Space h='md' />
      </ThesisOverviewChartProvider>
    </Container>
  )
}

export default ThesisOverviewPage
