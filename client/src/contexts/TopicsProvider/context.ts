import React, { Dispatch, SetStateAction } from 'react'
import { ITopic } from '../../requests/responses/topic'
import { PaginationResponse } from '../../requests/responses/pagination'

export interface ITopicsContext {
  topics: PaginationResponse<ITopic> | undefined
  page: number
  setPage: Dispatch<SetStateAction<number>>
  limit: number
  updateTopic: (thesis: ITopic) => unknown
  addTopic: (thesis: ITopic) => unknown
}

export const TopicsContext = React.createContext<ITopicsContext | undefined>(undefined)
