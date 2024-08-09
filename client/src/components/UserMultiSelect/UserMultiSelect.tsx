import { MultiSelect } from '@mantine/core'
import { useEffect, useState } from 'react'
import { doRequest } from '../../requests/request'
import { PaginationResponse } from '../../requests/responses/pagination'
import { ILightUser } from '../../requests/responses/user'
import { useDebouncedValue } from '@mantine/hooks'
import { GetInputPropsReturnType } from '@mantine/form/lib/types'
import { formatUser } from '../../utils/format'
import { arrayUnique } from '../../utils/array'

interface IUserMultiSelectProps extends GetInputPropsReturnType {
  maxValues?: number
  groups: string[]
  disabled?: boolean
  label?: string
  required?: boolean
  initialUsers?: ILightUser[]
}

const UserMultiSelect = (props: IUserMultiSelectProps) => {
  const {
    groups,
    maxValues = Infinity,
    initialUsers = [],
    disabled,
    label,
    required,
    ...inputProps
  } = props

  const selected: string[] = inputProps.value || []

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Array<{ value: string; label: string }>>([])
  const [searchValue, setSearchValue] = useState('')

  const [debouncedSearchValue] = useDebouncedValue(searchValue, 500)

  useEffect(() => {
    setLoading(true)

    return doRequest<PaginationResponse<ILightUser>>(
      '/v2/users',
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
      (res) => {
        if (res.ok) {
          setData((prevState) =>
            arrayUnique(
              [
                ...prevState.filter((item) => selected.includes(item.value)),
                ...res.data.content.map((user) => ({
                  value: user.userId,
                  label: formatUser(user),
                })),
              ],
              (a, b) => a.value === b.value,
            ),
          )
          setLoading(false)
        }
      },
    )
  }, [groups.join(','), debouncedSearchValue])

  return (
    <MultiSelect
      data={arrayUnique(
        [
          ...data,
          ...initialUsers
            .filter((user) => selected.includes(user.userId))
            .map((user) => ({
              value: user.userId,
              label: formatUser(user),
            })),
        ],
        (a, b) => a.value === b.value,
      )}
      disabled={disabled}
      searchable={selected.length < maxValues}
      clearable={true}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      hidePickedOptions={selected.length < maxValues}
      maxValues={maxValues}
      limit={10}
      filter={({ options }) => options}
      placeholder={selected.length < maxValues ? 'Search...' : undefined}
      nothingFoundMessage={!loading ? 'Nothing found...' : 'Loading...'}
      label={label}
      required={required}
      {...inputProps}
    />
  )
}

export default UserMultiSelect
