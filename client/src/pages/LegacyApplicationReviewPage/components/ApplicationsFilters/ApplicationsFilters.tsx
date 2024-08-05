import { Grid, MultiSelect, Select, TextInput } from '@mantine/core'
import { MagnifyingGlass } from 'phosphor-react'
import { ApplicationState } from '../../../../requests/responses/application'
import { useApplicationsContext } from '../../../../contexts/ApplicationsProvider/hooks'
import React from 'react'

const ApplicationsFilters = () => {
  const { filters, setFilters, sort, setSort } = useApplicationsContext()

  return (
    <Grid>
      <Grid.Col span={12}>
        <TextInput
          placeholder='Search applications...'
          leftSection={<MagnifyingGlass size={16} />}
          value={filters.search || ''}
          onChange={(e) => {
            setFilters((prev) => ({ ...prev, search: e.currentTarget.value }))
          }}
        />
      </Grid.Col>
      <Grid.Col span={6}>
        <MultiSelect
          hidePickedOptions
          label='Application State'
          data={Object.entries(ApplicationState).map(([key, value]) => {
            return {
              label: value,
              value: key,
            }
          })}
          value={filters.states || []}
          placeholder='Search status...'
          onChange={(value) => {
            setFilters((prev) => ({
              ...prev,
              states: value.length > 0 ? (value as ApplicationState[]) : undefined,
            }))
          }}
          leftSection={<MagnifyingGlass size={16} />}
          clearable
          searchable
        />
      </Grid.Col>
      <Grid.Col span={6}>
        <Select
          label='Sort By'
          data={[
            { label: 'Created Ascending', value: 'createdAt:asc' },
            { label: 'Created Descending', value: 'createdAt:desc' },
          ]}
          value={sort.column + ':' + sort.direction}
          onChange={(x) =>
            setSort({
              column: (x?.split(':')[0] || 'createdAt') as any,
              direction: (x?.split(':')[1] || 'asc') as any,
            })
          }
        />
      </Grid.Col>
    </Grid>
  )
}

export default ApplicationsFilters
