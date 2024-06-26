import React from 'react'
import EChartsThesisProgressChart from './components/EChartsThesisProgressChart/EChartsThesisProgressChart'
import { Box } from '@mantine/core'
import chartData from './mock/chart-data.json'
import { IThesisProgressChartDataElement } from './types/chart'
import { useParams } from 'react-router-dom'
import CustomThesisProgressChart from './components/CustomThesisProgressChart/CustomThesisProgressChart'
import ThesisProgressFilter from './components/ThesisProgressFilter/ThesisProgressFilter'

const ThesisOverview = () => {
  const { variant } = useParams<{ variant: string }>()

  return (
    <div style={{ padding: '0 0 5vh 0' }}>
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
        <ThesisProgressFilter />
        {variant === 'custom' ? (
          <CustomThesisProgressChart
            data={chartData.data as IThesisProgressChartDataElement[]}
            advisors={chartData.advisors as string[]}
          />
        ) : (
          <EChartsThesisProgressChart
            data={chartData.data as IThesisProgressChartDataElement[]}
            advisors={chartData.advisors as string[]}
          />
        )}
      </Box>
    </div>
  )
}

export default ThesisOverview
