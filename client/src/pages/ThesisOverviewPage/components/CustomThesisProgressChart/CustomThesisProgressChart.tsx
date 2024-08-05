import React, { useMemo } from 'react'
import { Grid, Skeleton } from '@mantine/core'
import { useThesisOverviewChart } from '../ThesisOverviewChartProvider/hooks'
import './CustomThesisProgressChart.css'
import { ThesisStateColor } from '../../types/chart'

interface ICustomThesisProgressChartProps {
  width: string
  height: number
}

const SCROLLABLE_LENGTH = 2000

const CustomThesisProgressChart = (props: ICustomThesisProgressChartProps) => {
  const { width, height } = props

  const { thesisData } = useThesisOverviewChart()

  const currentTime = useMemo(() => Date.now(), [])

  if (!thesisData) {
    return <Skeleton style={{ height: height + 'px', width }} />
  }

  const xAxisStart = Math.min(...thesisData.map((x) => x.started_at))
  const xAxisEnd = Math.max(...thesisData.map((x) => x.ended_at || currentTime), currentTime)
  const xAxisLength = xAxisEnd - xAxisStart

  return (
    <div className='CustomThesisProgressChart' style={{ height: height + 'px', width }}>
      <Grid>
        <Grid.Col span='content'>
          {thesisData.map((a) => (
            <div key={a.student} className='y-axis-label'>
              {a.student}
            </div>
          ))}
        </Grid.Col>
        <Grid.Col span='auto'>
          <div className='scroll-box'>
            <div style={{ width: SCROLLABLE_LENGTH + 100 }}>
              {thesisData.map((a) => {
                return (
                  <div key={a.student}>
                    <div
                      style={{
                        backgroundColor: 'transparent',
                        width: ((a.started_at - xAxisStart) / xAxisLength) * SCROLLABLE_LENGTH,
                      }}
                      className='chart-bar'
                    ></div>
                    {a.timeline.map((b, i) => {
                      const endAt = a.timeline[i + 1]?.started_at || a.ended_at || currentTime

                      return (
                        <div
                          key={b.state}
                          style={{
                            backgroundColor: ThesisStateColor[b.state],
                            width: ((endAt - b.started_at) / xAxisLength) * SCROLLABLE_LENGTH,
                          }}
                          className='chart-bar'
                        ></div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </Grid.Col>
      </Grid>
    </div>
  )
}

export default CustomThesisProgressChart
