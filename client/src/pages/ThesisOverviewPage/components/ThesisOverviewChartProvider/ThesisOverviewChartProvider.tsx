import React, { useMemo, useState } from 'react'
import { IThesisProgressChartDataElement, ThesisState } from '../../types/chart'
import ThesisOverviewChartContext, {
  IThesisOverviewChartContext,
  IThesisOverviewChartContextFilters,
  IThesisOverviewChartContextSort,
} from './context'

interface IThesisOverviewChartProviderProps {
  children: any
  mockData?: {
    thesisData: IThesisProgressChartDataElement[]
    advisors: string[]
  }
}

const ThesisOverviewChartProvider = (props: IThesisOverviewChartProviderProps) => {
  const { children, mockData } = props

  const [thesisData] = useState<IThesisProgressChartDataElement[] | undefined>(mockData?.thesisData)
  const [advisors, setAdvisors] = useState<string[] | undefined>(mockData?.advisors)
  const [filters, setFilters] = useState<IThesisOverviewChartContextFilters>({
    states: [ThesisState.proposal, ThesisState.writing, ThesisState.submitted, ThesisState.graded],
  })
  const [sort, setSort] = useState<IThesisOverviewChartContextSort>({
    column: 'start_date',
    direction: 'asc',
  })

  const contextState = useMemo<IThesisOverviewChartContext>(() => {
    const currentTime = Date.now()

    return {
      advisors,
      setAdvisors,
      thesisData: thesisData
        ?.filter((x) => {
          if (filters.advisors && !filters.advisors.includes(x.advisor)) {
            return false
          }

          if (filters.states && !filters.states.includes(x.state)) {
            return false
          }

          const elementRange: [number, number] = [x.started_at, x.ended_at || currentTime]

          const filterRange: [number, number] = [
            typeof filters.startDate === 'number' ? filters.startDate : 0,
            typeof filters.endDate === 'number' ? filters.endDate : currentTime,
          ]

          return (
            (elementRange[0] >= filterRange[0] && elementRange[0] <= filterRange[1]) ||
            (elementRange[1] >= filterRange[0] && elementRange[1] <= filterRange[1])
          )
        })
        .sort((a, b) => {
          let aComparibleNumber = 0
          let bComparibleNumber = 0

          if (sort.column === 'start_date') {
            aComparibleNumber = a.started_at
            bComparibleNumber = b.started_at
          }

          if (sort.column === 'end_date') {
            aComparibleNumber = a.ended_at || currentTime
            bComparibleNumber = b.ended_at || currentTime
          }

          if (sort.column === 'advisor') {
            aComparibleNumber = a.advisor.localeCompare(b.advisor)
            bComparibleNumber = 0
          }

          if (sort.direction === 'asc') {
            return aComparibleNumber - bComparibleNumber
          } else {
            return bComparibleNumber - aComparibleNumber
          }
        }),
      filters,
      setFilters,
      sort,
      setSort,
    }
  }, [thesisData, advisors, filters, sort])

  return (
    <ThesisOverviewChartContext.Provider value={contextState}>
      {children}
    </ThesisOverviewChartContext.Provider>
  )
}

export default ThesisOverviewChartProvider
