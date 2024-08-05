import { IThesis, ThesisState } from '../requests/responses/thesis'

export function isThesisClosed(thesis: IThesis) {
  return thesis.state === ThesisState.FINISHED || thesis.state === ThesisState.DROPPED_OUT
}