import { MultiSelect } from '@mantine/core'
import { useEffect, useState } from 'react'
import { doRequest } from '../../requests/request'
import { PaginationResponse } from '../../requests/responses/pagination'
import { ILightUser } from '../../requests/responses/user'
import { useDebouncedValue } from '@mantine/hooks'
import { GetInputPropsReturnType } from '@mantine/form/lib/types'
import { formatUser } from '../../utils/format'
import { arrayUnique } from '../../utils/array'
import { showSimpleError } from '../../utils/notification'
import { getApiResponseErrorMessage } from '../../requests/handler'
import AvatarUser from '../AvatarUser/AvatarUser'

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
  const [focused, setFocused] = useState(false)
  const [data, setData] = useState<Array<{ value: string; label: string; user: ILightUser }>>([])
  const [searchValue, setSearchValue] = useState('')

  const [debouncedSearchValue] = useDebouncedValue(searchValue, 500)

  useEffect(() => {
    if (!focused) {
      return
    }

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
                  label: formatUser(user, { withUniversityId: true }),
                  user: user,
                })),
              ],
              (a, b) => a.value === b.value,
            ),
          )
          setLoading(false)
        } else {
          showSimpleError(getApiResponseErrorMessage(res))
        }
      },
    )
  }, [groups.join(','), debouncedSearchValue, focused])

  const mergedData = arrayUnique(
    [
      ...data,
      ...initialUsers
        .filter((user) => selected.includes(user.userId))
        .map((user) => ({
          value: user.userId,
          label: formatUser(user, { withUniversityId: true }),
          user,
        })),
    ],
    (a, b) => a.value === b.value,
  )

  useEffect(() => {
    if (selected.some((a) => !mergedData.some((b) => a === b.value))) {
      setFocused(true)
    }
  }, [mergedData.map((row) => row.value).join(','), selected.join(',')])

  return (
    <MultiSelect
      data={mergedData}
      renderOption={({ option }) => {
        const item = mergedData.find((row) => row.value === option.value)

        if (!item) {
          return null
        }

        return <AvatarUser user={item.user} withUniversityId={true} />
      }}
      disabled={disabled}
      searchable={selected.length < maxValues}
      clearable={true}
      searchValue={searchValue}
      onClick={() => setFocused(true)}
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
