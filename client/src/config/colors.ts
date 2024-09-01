import { ThesisState } from '../requests/responses/thesis'
import { ApplicationState } from '../requests/responses/application'
import { GLOBAL_CONFIG } from './global'

export const ThesisStateColor: Record<ThesisState, string> = {
  [ThesisState.PROPOSAL]: '#FFB347',
  [ThesisState.WRITING]: '#4A69BD',
  [ThesisState.SUBMITTED]: '#1E3799',
  [ThesisState.ASSESSED]: '#F8C291',
  [ThesisState.GRADED]: '#78e08f',
  [ThesisState.FINISHED]: '#38ada9',
  [ThesisState.DROPPED_OUT]: '#E55039',
}

export const ApplicationStateColor: Record<ApplicationState, string> = {
  [ApplicationState.ACCEPTED]: '#26de81',
  [ApplicationState.REJECTED]: '#fc5c65',
  [ApplicationState.NOT_ASSESSED]: '#6c6c6c',
}

const availableThesisColors = ['#2E7D32', '#6A1B9A', '#00796B', '#C62828', '#455A64']
export const ThesisTypeColor: Record<string, string> = Object.fromEntries(
  Object.keys(GLOBAL_CONFIG.thesis_types).map((key, index) => [
    key,
    availableThesisColors[index % availableThesisColors.length],
  ]),
)
