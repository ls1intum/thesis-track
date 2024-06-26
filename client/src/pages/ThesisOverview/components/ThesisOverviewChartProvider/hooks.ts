import { useContext } from 'react'
import ThesisOverviewChartContext from './context'

export function useThesisOverviewChart() {
  const data = useContext(ThesisOverviewChartContext)

  if (!data) {
    throw new Error('ThesisOverviewChartContext not properly initialized')
  }

  return data
}
