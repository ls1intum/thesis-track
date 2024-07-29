import { MultiSelect } from '@mantine/core'
import { GetInputPropsReturnType } from '@mantine/form/lib/types'
import { useEffect, useState } from 'react'
import { doRequest } from '../../requests/request'
import { Pageable } from '../../requests/responses/pageable'
import { ILightUser } from '../../requests/responses/user'
import { useDebouncedValue } from '@mantine/hooks'

interface IUserMultiSelectProps extends GetInputPropsReturnType {
  multiSelect: boolean
  groups: string[]
  label?: string
  withAsterisk?: boolean
  required?: boolean
}

const UserMultiSelect = (props: IUserMultiSelectProps) => {
  const { groups, multiSelect, label, required, withAsterisk, ...inputProps } = props

  const [data, setData] = useState<Array<{ value: string; label: string }>>()
  const [searchValue, setSearchValue] = useState('')

  const [debouncedSearchValue] = useDebouncedValue(searchValue, 500)

  useEffect(() => {
    setData(undefined)

    return doRequest<Pageable<ILightUser>>(
      '/v1/users',
      {
        method: 'GET',
        requiresAuth: true,
        params: {
          groups: groups.join(','),
          searchQuery: debouncedSearchValue,
          page: '0',
          limit: '100',
        },
      },
      (err, res) => {
        if (res?.ok) {
          setData(
            res.data.content.map((user) => ({
              value: user.userId,
              label: `${user.firstName} ${user.lastName} (${user.universityId})`,
            })),
          )
        }
      },
    )
  }, [groups.join(','), debouncedSearchValue])

  return (
    <MultiSelect
      data={data ?? []}
      searchable={true}
      clearable={true}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      hidePickedOptions={true}
      maxValues={multiSelect ? undefined : 1}
      limit={10}
      filter={({ options }) => options}
      placeholder='Search...'
      nothingFoundMessage={data ? 'Nothing found...' : 'Loading...'}
      label={label}
      required={required}
      withAsterisk={withAsterisk}
      {...inputProps}
    />
  )
}

export default UserMultiSelect
