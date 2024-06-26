import React from 'react'
import EChartsThesisProgressChart from './components/EChartsThesisProgressChart/EChartsThesisProgressChart'
import { Box } from '@mantine/core'
import chartData from './mock/chart-data.json'
import { useParams } from 'react-router-dom'
import CustomThesisProgressChart from './components/CustomThesisProgressChart/CustomThesisProgressChart'
import ThesisProgressFilter from './components/ThesisProgressFilter/ThesisProgressFilter'
import ThesisOverviewChartProvider from './components/ThesisOverviewChartProvider/ThesisOverviewChartProvider'
import { IThesisProgressChartDataElement } from './types/chart'

const ThesisOverview = () => {
  const { variant } = useParams<{ variant: string }>()

  return (
    <div style={{ padding: '20px 0 5vh 0' }}>
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '80vw',
          gap: '2vh',
        }}
        mx='auto'
        pos='relative'
      >
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
          {variant === 'custom' ? (
            <CustomThesisProgressChart width='100%' height={700} />
          ) : (
            <EChartsThesisProgressChart width='100%' height={700} />
          )}
        </ThesisOverviewChartProvider>
      </Box>
    </div>
  )
}

export default ThesisOverview
