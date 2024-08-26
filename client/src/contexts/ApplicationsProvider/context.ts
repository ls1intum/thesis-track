import React, { Dispatch, SetStateAction } from 'react'
import { PaginationResponse } from '../../requests/responses/pagination'
import { ApplicationState, IApplication } from '../../requests/responses/application'

export interface IApplicationsFilters {
  search?: string
  states?: ApplicationState[]
  topics?: string[]
}

export interface IApplicationsSort {
  column: 'createdAt' | 'updatedAt'
  direction: 'asc' | 'desc'
}

export interface IApplicationsContext {
  applications: PaginationResponse<IApplication> | undefined
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
