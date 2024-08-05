import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { ThesesContext, IThesesContext, IThesesFilters, IThesesSort } from './context'
import { IThesis, ThesisState } from '../../requests/responses/thesis'
import { doRequest } from '../../requests/request'
import { Pageable } from '../../requests/responses/pageable'
import { notifications } from '@mantine/notifications'
import { useDebouncedValue } from '@mantine/hooks'

interface IThesesProviderProps {
  fetchAll?: boolean
  limit?: number
  defaultStates?: ThesisState[]
  hideIfEmpty?: boolean
}

const ThesesProvider = (props: PropsWithChildren<IThesesProviderProps>) => {
  const { children, fetchAll = false, limit = 50, hideIfEmpty = false } = props

  const [theses, setTheses] = useState<Pageable<IThesis>>()
  const [page, setPage] = useState(0)

  const [filters, setFilters] = useState<IThesesFilters>({
    states: [
      ThesisState.PROPOSAL,
      ThesisState.WRITING,
      ThesisState.SUBMITTED,
      ThesisState.ASSESSED,
      ThesisState.GRADED,
    ],
  })
  const [sort, setSort] = useState<IThesesSort>({
    column: 'startDate',
    direction: 'asc',
  })

  const [debouncedSearch] = useDebouncedValue(filters.search || '', 500)

  useEffect(() => {
    setTheses(undefined)

    return doRequest<Pageable<IThesis>>(
      `/v1/theses`,
      {
        method: 'GET',
        requiresAuth: true,
        params: {
          fetchAll: fetchAll ? 'true' : 'false',
          search: debouncedSearch,
          state: filters.states?.join(',') ?? '',
          sortBy: sort.column,
          sortOrder: sort.direction,
        },
      },
      (res) => {
        if (!res.ok) {
          notifications.show({
            color: 'red',
            autoClose: 10000,
            title: 'Error',
            message: `Could not fetch theses: ${res.status}`,
          })

          return setTheses({
            content: [],
            totalPages: 0,
            totalElements: 0,
            last: true,
            pageNumber: 0,
            pageSize: limit,
          })
        }

        setTheses(res.data)
      },
    )
  }, [fetchAll, page, limit, sort, filters.states?.join(','), debouncedSearch])

  const contextState = useMemo<IThesesContext>(() => {
    return {
      theses,
      filters,
      setFilters: (value) => {
        setPage(0)
        setFilters(value)
      },
      sort,
      setSort: (value) => {
        setPage(0)
        setSort(value)
      },
      page,
      setPage,
      limit,
      updateThesis: (newThesis) => {
        setTheses((prev) => {
          if (!prev) {
            return undefined
          }

          const index = prev.content.findIndex((x) => x.thesisId === newThesis.thesisId)

          if (index >= 0) {
            prev.content[index] = newThesis
          }

          return { ...prev }
        })
      },
    }
  }, [theses, filters, sort, page, limit])

  if (hideIfEmpty && page === 0 && (!theses || theses.content.length === 0)) {
    return <></>
  }

  return <ThesesContext.Provider value={contextState}>{children}</ThesesContext.Provider>
}

export default ThesesProvider
