import React, { Dispatch, SetStateAction } from 'react'
import { IThesisProgressChartDataElement } from '../../types/chart'
import { ThesisState } from '../../../../requests/responses/thesis'

export interface IThesisOverviewChartContextFilters {
  advisors?: string[]
  states?: ThesisState[]
  startDate?: number
  endDate?: number
}

export interface IThesisOverviewChartContextSort {
  column: 'start_date' | 'end_date' | 'advisor'
  direction: 'asc' | 'desc'
}

export interface IThesisOverviewChartContext {
  thesisData: IThesisProgressChartDataElement[] | undefined
  advisors: string[] | undefined
  filters: IThesisOverviewChartContextFilters
  setFilters: Dispatch<SetStateAction<IThesisOverviewChartContextFilters>>
  sort: IThesisOverviewChartContextSort
  setSort: Dispatch<SetStateAction<IThesisOverviewChartContextSort>>
}

const ThesisOverviewChartContext = React.createContext<IThesisOverviewChartContext | undefined>(
  undefined,
)

export default ThesisOverviewChartContext
