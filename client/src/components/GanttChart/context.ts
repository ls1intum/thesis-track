import React, { Dispatch, ReactNode, SetStateAction, useContext } from 'react'

export type DateRange = [number, number]

export interface IGanttChartDataElement {
  id: string
  groupId: string
  groupNode: ReactNode
  columns: ReactNode[]
  timeline: Array<{
    id: string
    startDate: Date
    endDate: Date
    color: string
  }>
  events: Array<{
    id: string
    icon: ReactNode
    time: Date
  }>
}

export interface IGanttChartContext {
  data: IGanttChartDataElement[]
  currentTime: number
  totalRange: DateRange
  filteredRange: DateRange
  setRange: Dispatch<SetStateAction<DateRange | undefined>>
  isVisible: (range: DateRange) => boolean
  getTimelineLeftPosition: (time: number) => string
  getTimelineWidth: (range: DateRange) => string
}

export const GanttChartContext = React.createContext<IGanttChartContext | undefined>(undefined)

export function useGanttChartContext() {
  const data = useContext(GanttChartContext)

  if (!data) {
    throw new Error('GanttChartContext not initialized')
  }

  return data
}
