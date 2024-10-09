import { Center, Checkbox, Grid, Stack } from '@mantine/core'
import { GLOBAL_CONFIG } from '../../config/global'
import React from 'react'
import { useTopicsContext } from '../../providers/TopicsProvider/hooks'
import { formatThesisType } from '../../utils/format'

interface ITopicsFiltersProps {
  visible: Array<'type' | 'closed'>
}

const TopicsFilters = (props: ITopicsFiltersProps) => {
  const { visible } = props

  const { filters, setFilters } = useTopicsContext()

  return (
    <Stack>
      {visible.includes('closed') && (
        <Checkbox
          label='Show Closed Topics'
          checked={!!filters.includeClosed}
          onChange={(e) => {
            setFilters({
              includeClosed: e.target.checked,
            })
          }}
        />
      )}
      {visible.includes('type') && (
        <Grid mb='md' grow>
          {Object.keys(GLOBAL_CONFIG.thesis_types).map((key) => (
            <Grid.Col key={key} span={{ md: 3 }}>
              <Center>
                <Checkbox
                  label={formatThesisType(key)}
                  checked={!!filters.types?.includes(key)}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      types: [...(prev.types || []), key].filter(
                        (row) => e.target.checked || row !== key,
                      ),
                    }))
                  }}
                />
              </Center>
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Stack>
  )
}

export default TopicsFilters
