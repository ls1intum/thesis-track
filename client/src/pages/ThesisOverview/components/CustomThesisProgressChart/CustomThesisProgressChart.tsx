import React from 'react'
import { Skeleton } from '@mantine/core'
import { useThesisOverviewChart } from '../ThesisOverviewChartProvider/hooks'

interface ICustomThesisProgressChartProps {
  width: string
  height: number
}

const CustomThesisProgressChart = (props: ICustomThesisProgressChartProps) => {
  const { width, height } = props

  const { thesisData } = useThesisOverviewChart()

  if (!thesisData) {
    return <Skeleton style={{ height: height + 'px', width }} />
  }

  return <div></div>
}

export default CustomThesisProgressChart
