import React from 'react'
import { MultiSelect, Select } from '@mantine/core'
import { useThesisOverviewChart } from '../ThesisOverviewChartProvider/hooks'
import { ThesisState } from '../../types/chart'
import { DateInput } from '@mantine/dates'

const ThesisOverviewFilter = () => {
  const { filters, advisors, setFilters, sort, setSort } = useThesisOverviewChart()

  return (
    <div>
      <MultiSelect
        hidePickedOptions
        label='Advisors'
        placeholder='Select Advisors'
        data={advisors}
        value={filters.advisors}
        onChange={(x) =>
          setFilters((prev) => ({ ...prev, advisors: x.length > 0 ? x : undefined }))
        }
        searchable={true}
      />
      <MultiSelect
        hidePickedOptions
        label='States'
        placeholder='Select Thesis States'
        data={Object.values(ThesisState)}
        value={filters.states}
        onChange={(x) =>
          setFilters((prev) => ({
            ...prev,
            states: x.length > 0 ? (x as ThesisState[]) : undefined,
          }))
        }
      />
      <DateInput
        value={filters.startDate ? new Date(filters.startDate) : undefined}
        onChange={(x) => setFilters((prev) => ({ ...prev, startDate: x?.getTime() ?? undefined }))}
        label='Start Date'
        clearable={true}
      />
      <DateInput
        value={filters.endDate ? new Date(filters.endDate) : undefined}
        onChange={(x) => setFilters((prev) => ({ ...prev, endDate: x?.getTime() ?? undefined }))}
        label='End Date'
        clearable={true}
      />
      <Select
        label='Sort By'
        data={[
          { label: 'Start Date Ascending', value: 'start_date:asc' },
          { label: 'Start Date Descending', value: 'start_date:desc' },
          { label: 'Advisor Name', value: 'advisor:asc' },
        ]}
        value={sort.column + ':' + sort.direction}
        onChange={(x) =>
          setSort({
            column: (x?.split(':')[0] || 'start_date') as any,
            direction: (x?.split(':')[1] || 'asc') as any,
          })
        }
      />
    </div>
  )
}

export default ThesisOverviewFilter
