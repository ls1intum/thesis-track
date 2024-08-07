import React, { PropsWithChildren, ReactNode, useEffect, useMemo, useState } from 'react'
import { doRequest } from '../../requests/request'
import { Pageable } from '../../requests/responses/pageable'
import {
  ApplicationsContext,
  IApplicationsContext,
  IApplicationsFilters,
  IApplicationsSort,
} from './context'
import { ApplicationState, IApplication } from '../../requests/responses/application'
import { useDebouncedValue } from '@mantine/hooks'
import { showSimpleError } from '../../utils/notification'

interface IApplicationsProviderProps {
  fetchAll?: boolean
  limit?: number
  defaultStates?: ApplicationState[]
  hideIfEmpty?: boolean
  emptyComponent?: ReactNode
}

const ApplicationsProvider = (props: PropsWithChildren<IApplicationsProviderProps>) => {
  const {
    children,
    fetchAll = false,
    limit = 50,
    defaultStates,
    hideIfEmpty = false,
    emptyComponent,
  } = props

  const [applications, setApplications] = useState<Pageable<IApplication>>()
  const [page, setPage] = useState(0)

  const [filters, setFilters] = useState<IApplicationsFilters>({
    states: defaultStates || [],
  })
  const [sort, setSort] = useState<IApplicationsSort>({
    column: 'createdAt',
    direction: 'desc',
  })

  const [debouncedSearch] = useDebouncedValue(filters.search || '', 500)

  useEffect(() => {
    setPage(0)
  }, [sort, filters])

  useEffect(() => {
    setApplications(undefined)

    return doRequest<Pageable<IApplication>>(
      `/v2/applications`,
      {
        method: 'GET',
        requiresAuth: true,
        params: {
          fetchAll: fetchAll ? 'true' : 'false',
          search: debouncedSearch,
          state: filters.states?.join(',') ?? '',
          page,
          sortBy: sort.column,
          sortOrder: sort.direction,
        },
      },
      (res) => {
        if (!res.ok) {
          showSimpleError(`Could not fetch applications: ${res.status}`)

          return setApplications({
            content: [],
            totalPages: 0,
            totalElements: 0,
            last: true,
            pageNumber: 0,
            pageSize: limit,
          })
        }

        setApplications(res.data)
      },
    )
  }, [fetchAll, page, limit, sort, filters.states?.join(','), debouncedSearch])

  const contextState = useMemo<IApplicationsContext>(() => {
    return {
      applications,
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
      updateApplication: (newApplication) => {
        setApplications((prev) => {
          if (!prev) {
            return undefined
          }

          const index = prev.content.findIndex(
            (x) => x.applicationId === newApplication.applicationId,
          )

          if (index >= 0) {
            prev.content[index] = newApplication
          }

          return { ...prev }
        })
      },
    }
  }, [applications, filters, sort, page, limit])

  if (hideIfEmpty && page === 0 && (!applications || applications.content.length === 0)) {
    return <>{emptyComponent}</>
  }

  return (
    <ApplicationsContext.Provider value={contextState}>{children}</ApplicationsContext.Provider>
  )
}

export default ApplicationsProvider
