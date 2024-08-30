import React from 'react'
import { Grid, MultiSelect, Select, TextInput } from '@mantine/core'
import { useThesesContext } from '../../contexts/ThesesProvider/hooks'
import { ThesisState } from '../../requests/responses/thesis'
import { MagnifyingGlass } from 'phosphor-react'
import { formatThesisState } from '../../utils/format'
import { GLOBAL_CONFIG } from '../../config/global'

const ThesesFilters = () => {
  const { filters, setFilters, sort, setSort } = useThesesContext()

  return (
    <Grid gutter='xs'>
      <Grid.Col span={6}>
        <TextInput
          label='Search'
          placeholder='Search theses...'
          leftSection={<MagnifyingGlass size={16} />}
          value={filters.search || ''}
          onChange={(x) => setFilters((prev) => ({ ...prev, search: x.target.value || undefined }))}
        />
      </Grid.Col>
      <Grid.Col span={6}>
        <Select
          label='Sort By'
          data={[
            { label: 'Start Date Ascending', value: 'startDate:asc' },
            { label: 'Start Date Descending', value: 'startDate:desc' },
            { label: 'Created Ascending', value: 'createdAt:asc' },
            { label: 'Created Descending', value: 'createdAt:desc' },
          ]}
          value={sort.column + ':' + sort.direction}
          onChange={(x) =>
            setSort({
              column: (x?.split(':')[0] || 'startDate') as any,
              direction: (x?.split(':')[1] || 'asc') as any,
            })
          }
        />
      </Grid.Col>
      <Grid.Col span={6}>
        <MultiSelect
          hidePickedOptions
          label='Thesis Type'
          data={Object.keys(GLOBAL_CONFIG.thesis_types).map((key) => ({
            value: key,
            label: GLOBAL_CONFIG.thesis_types[key],
          }))}
          value={filters.types || []}
          onChange={(x) =>
            setFilters((prev) => ({
              ...prev,
              types: x.length > 0 ? x : undefined,
            }))
          }
        />
      </Grid.Col>
      <Grid.Col span={6}>
        <MultiSelect
          hidePickedOptions
          label='Thesis State'
          data={Object.values(ThesisState).map((value) => ({
            value: value,
            label: formatThesisState(value),
          }))}
          value={filters.states || []}
          onChange={(x) =>
            setFilters((prev) => ({
              ...prev,
              states: x.length > 0 ? (x as ThesisState[]) : undefined,
            }))
          }
        />
      </Grid.Col>
    </Grid>
  )
}

export default ThesesFilters
