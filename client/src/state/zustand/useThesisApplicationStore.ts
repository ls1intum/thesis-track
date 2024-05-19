import { create } from 'zustand'
import { ThesisAdvisor, ThesisApplication } from '../../interface/thesisApplication'

interface ThesisApplicationStoreState {
  thesisApplications: ThesisApplication[]
  thesisAdvisors: ThesisAdvisor[]
}

interface ThesisApplicationStoreAction {
  setThesisApplications: (thesisApplications: ThesisApplication[]) => void
  setThesisAdvisors: (thesisAdvisors: ThesisAdvisor[]) => void
}

export const useThesisApplicationStore = create<
  ThesisApplicationStoreState & ThesisApplicationStoreAction
>((set) => ({
  thesisApplications: [],
  thesisAdvisors: [],
  setThesisApplications: (thesisApplications) => set({ thesisApplications: thesisApplications }),
  setThesisAdvisors: (thesisAdvisors) => set({ thesisAdvisors: thesisAdvisors }),
}))
