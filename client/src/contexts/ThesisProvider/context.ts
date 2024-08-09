import { IThesis } from '../../requests/responses/thesis'
import React from 'react'

export interface IThesisContext {
  thesis: IThesis | undefined | false
  updateThesis: (thesis: IThesis) => unknown
  access: {
    student: boolean
    advisor: boolean
    supervisor: boolean
  }
}

export const ThesisContext = React.createContext<IThesisContext | undefined>(undefined)
