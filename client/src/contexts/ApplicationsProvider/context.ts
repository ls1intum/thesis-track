import React, { Dispatch, SetStateAction } from 'react'
import { Pageable } from '../../requests/responses/pageable'
import { ApplicationState, IApplication } from '../../requests/responses/application'

export interface IApplicationsFilters {
  search?: string
  states?: ApplicationState[]
}

export interface IApplicationsSort {
  column: 'createdAt' | 'updatedAt'
  direction: 'asc' | 'desc'
}

export interface IApplicationsContext {
  applications: Pageable<IApplication> | undefined
  filters: IApplicationsFilters
  setFilters: Dispatch<SetStateAction<IApplicationsFilters>>
  sort: IApplicationsSort
  setSort: Dispatch<SetStateAction<IApplicationsSort>>
  page: number
  setPage: Dispatch<SetStateAction<number>>
  limit: number
  updateApplication: (application: IApplication) => unknown
}

export const ApplicationsContext = React.createContext<IApplicationsContext | undefined>(undefined)
