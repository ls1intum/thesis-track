import { IThesis, IThesisComment } from '../../requests/responses/thesis'
import React, { Dispatch, SetStateAction } from 'react'
import { PaginationResponse } from '../../requests/responses/pagination'

export interface IThesisCommentsContext {
  thesis: IThesis
  comments: PaginationResponse<IThesisComment> | undefined
  limit: number
  page: number
  setPage: Dispatch<SetStateAction<number>>
  posting: boolean
  deleteComment: (comment: IThesisComment) => unknown
  postComment: (message: string, file: File | undefined) => unknown
}

export const ThesisCommentsContext = React.createContext<IThesisCommentsContext | undefined>(
  undefined,
)
