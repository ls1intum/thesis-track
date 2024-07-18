import React, { useMemo } from 'react'
import ReactEChartsCore from 'echarts-for-react'
import * as echarts from 'echarts'
import { ThesisStateColor } from '../../types/chart'
import { EChartsOption, ERectangle } from 'echarts'
import {
  CustomSeriesRenderItemAPI,
  CustomSeriesRenderItemParams,
  CustomSeriesRenderItemReturn,
} from 'echarts/types/dist/echarts'
import RenderItemParams = echarts.EChartOption.SeriesCustom.RenderItemParams
import { useThesisOverviewChart } from '../ThesisOverviewChartProvider/hooks'
import { Skeleton } from '@mantine/core'
import { useColorScheme } from '@mantine/hooks'

interface IEChartsThesisProgressChartProps {
  width: string
  height: number
}

const EChartsThesisProgressChart = (props: IEChartsThesisProgressChartProps) => {
  const { width, height } = props

  const { thesisData } = useThesisOverviewChart()
  const colorScheme = useColorScheme()

  const currentTime = useMemo(() => {
    return Date.now()
  }, [])

  const options = useMemo<EChartsOption | undefined>(() => {
    if (!thesisData) {
      return undefined
    }

    const data = [...thesisData].reverse()

    function clipRectByRect(params: RenderItemParams, rect: ERectangle) {
      if (!params.coordSys) {
        throw new Error('Rectangle does not exist on params')
      }

      return echarts.graphic.clipRectByRect(rect, {
        x: params.coordSys.x!,
        y: params.coordSys.y!,
        width: params.coordSys.width!,
        height: params.coordSys.height!,
      })
    }

    const chartPages = Math.ceil((data.length * 35) / height)

    return {
      tooltip: {},
      backgroundColor: 'transparent',
      dataZoom: [
        {
          type: 'slider',
          xAxisIndex: 0,
          filterMode: 'weakFilter',
          height: 20,
          bottom: 10,
          startValue: currentTime - 3600 * 1000 * 24 * 30 * 5,
          endValue: currentTime,
          showDetail: false,
        },
        {
          type: 'inside',
          id: 'insideX',
          xAxisIndex: 0,
          filterMode: 'weakFilter',
          startValue: currentTime - 3600 * 1000 * 24 * 30 * 5,
          endValue: currentTime,
          zoomOnMouseWheel: false,
          moveOnMouseMove: true,
        },
        ...(chartPages > 1
          ? [
              {
                type: 'slider',
                yAxisIndex: 0,
                zoomLock: true,
                width: 10,
                right: 10,
                top: 30,
                bottom: 40,
                start: 100,
                end: 100 - 100 / chartPages,
                handleSize: 0,
                showDetail: false,
              },
              {
                type: 'inside',
                id: 'insideY',
                yAxisIndex: 0,
                start: 100,
                end: 100 - 100 / chartPages,
                zoomOnMouseWheel: false,
                moveOnMouseMove: true,
                moveOnMouseWheel: true,
              },
            ]
          : []),
      ],
      grid: {
        show: true,
        top: 10,
        bottom: 40,
        left: 10,
        right: 30,
        backgroundColor: 'transparent',
        containLabel: true,
      },
      xAxis: {
        type: 'time',
        position: 'top',
        axisLabel: {
          inside: false,
          align: 'center',
        },
        axisTick: {
          show: true,
        },
      },
      yAxis: {
        type: 'category',
        position: 'left',
        axisTick: {
          show: false,
        },
      },
      series: [
        {
          type: 'custom',
          renderItem: (
            params: CustomSeriesRenderItemParams,
            api: CustomSeriesRenderItemAPI,
          ): CustomSeriesRenderItemReturn => {
            const dataIndex = params.dataIndex
            const item = data[dataIndex]

            const startTime = item.started_at
            const endTime = item.ended_at || currentTime

            const startTimeCoords = api.coord([startTime, dataIndex])
            const endTimeCoords = api.coord([endTime, dataIndex])

            const totalTime = endTime - startTime
            const barLength = endTimeCoords[0] - startTimeCoords[0]
            const barHeight = 20

            return {
              type: 'group',
              children: item.timeline.map((element) => {
                const percentage = (element.started_at - startTime) / totalTime

                return {
                  type: 'rect',
                  style: api.style({ fill: ThesisStateColor[element.state] }),
                  shape: clipRectByRect(params as RenderItemParams, {
                    x: startTimeCoords[0] + percentage * barLength,
                    y: startTimeCoords[1] - barHeight / 2,
                    width: (1 - percentage) * barLength,
                    height: barHeight,
                  }),
                }
              }),
            }
          },
          encode: {
            x: [2, 3],
            y: 1,
            tooltip: [4, 5, 2, 6],
          },
          clip: true,
          dimensions: [
            'Index',
            'Student',
            'Started At',
            'Last Update',
            'Advisor',
            'Topic',
            'State',
          ],
          data: data.map((element, index) => [
            index,
            element.student,
            element.started_at - 3600 * 24 * 1000,
            (element.ended_at || currentTime) + 3600 * 24 * 1000,
            element.advisor,
            element.topic,
            element.state,
          ]),
        },
      ],
    }
  }, [thesisData, currentTime, height])

  if (!options) {
    return <Skeleton style={{ height: height + 'px', width }} />
  }

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={options}
      theme={colorScheme}
      style={{ height: height + 'px', width }}
    />
  )
}

export default EChartsThesisProgressChart
