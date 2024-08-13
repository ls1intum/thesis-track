import React, { Dispatch, SetStateAction } from 'react'
import { Pageable } from '../../requests/responses/pageable'
import { ITopic } from '../../requests/responses/topic'

export interface ITopicsContext {
  topics: Pageable<ITopic> | undefined
  page: number
  setPage: Dispatch<SetStateAction<number>>
  limit: number
  updateTopic: (thesis: ITopic) => unknown
}

export const TopicsContext = React.createContext<ITopicsContext | undefined>(undefined)
