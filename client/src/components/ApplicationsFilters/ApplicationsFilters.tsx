import { Grid, MultiSelect, Select, TextInput } from '@mantine/core'
import { MagnifyingGlass } from 'phosphor-react'
import { ApplicationState } from '../../requests/responses/application'
import { useApplicationsContext } from '../../providers/ApplicationsProvider/hooks'
import React from 'react'
import { formatApplicationState, formatThesisType } from '../../utils/format'
import { GLOBAL_CONFIG } from '../../config/global'

interface IApplicationsFiltersProps {
  size?: 'xl' | 'sm'
}

const ApplicationsFilters = (props: IApplicationsFiltersProps) => {
  const { size = 'xl' } = props

  const { topics, filters, setFilters, sort, setSort } = useApplicationsContext()

  return (
    <Grid gutter='sm'>
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
      <Grid.Col span={size === 'sm' ? 12 : 6}>
        <MultiSelect
          hidePickedOptions
          label='Topic'
          placeholder='Open Topics'
          data={[
            {
              value: 'NO_TOPIC',
              label: 'Suggested Topic',
            },
            ...(topics
              ? Object.values(topics).map((topic) => ({
                  value: topic.topicId,
                  label: topic.title,
                }))
              : []),
          ]}
          value={filters.topics || []}
          onChange={(value) => {
            setFilters((prev) => ({
              ...prev,
              topics: value.length > 0 ? value : undefined,
            }))
          }}
          searchable
        />
      </Grid.Col>
      <Grid.Col span={size === 'sm' ? 12 : 6}>
        <MultiSelect
          hidePickedOptions
          label='Type'
          placeholder='Thesis Types'
          data={Object.keys(GLOBAL_CONFIG.thesis_types).map((key) => ({
            value: key,
            label: formatThesisType(key),
          }))}
          value={filters.types || []}
          onChange={(value) => {
            setFilters((prev) => ({
              ...prev,
              types: value.length > 0 ? value : undefined,
            }))
          }}
          searchable
        />
      </Grid.Col>
      <Grid.Col span={size === 'sm' ? 12 : 6}>
        <MultiSelect
          hidePickedOptions
          label='States'
          placeholder='Application States'
          data={Object.values(ApplicationState).map((value) => ({
            value: value,
            label: formatApplicationState(value),
          }))}
          value={filters.states || []}
          onChange={(value) => {
            setFilters((prev) => ({
              ...prev,
              states: value.length > 0 ? (value as ApplicationState[]) : undefined,
            }))
          }}
          searchable
        />
      </Grid.Col>
      <Grid.Col span={size === 'sm' ? 12 : 6}>
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
