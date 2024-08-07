import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { IThesis } from '../../requests/responses/thesis'
import { useThesis } from '../../hooks/fetcher'
import { IThesisContext, ThesisContext } from './context'
import { useUser } from '../../hooks/authentication'
import NotFound from '../../components/NotFound/NotFound'
import PageLoader from '../../components/PageLoader/PageLoader'

interface IThesisProviderProps {
  thesisId: string | undefined
  requireLoadedThesis?: boolean
}

const ThesisProvider = (props: PropsWithChildren<IThesisProviderProps>) => {
  const { children, thesisId, requireLoadedThesis = false } = props

  const loadedThesis = useThesis(thesisId)
  const user = useUser()

  const [thesis, setThesis] = useState<IThesis | undefined | false>(loadedThesis)

  useEffect(() => {
    setThesis(loadedThesis)
  }, [loadedThesis])

  const contextState = useMemo<IThesisContext>(() => {
    const access = {
      supervisor: false,
      advisor: false,
      student: false,
    }

    if (user && thesis) {
      if (
        user.groups.includes('admin') ||
        thesis.supervisors.some((supervisor) => user.userId === supervisor.userId)
      ) {
        access.supervisor = true
      }

      if (access.supervisor || thesis.advisors.some((advisor) => user.userId === advisor.userId)) {
        access.advisor = true
      }

      if (access.advisor || thesis.students.some((student) => user.userId === student.userId)) {
        access.student = true
      }
    }

    return {
      thesis,
      updateThesis: (newThesis: IThesis) => {
        if (newThesis.thesisId !== thesisId) {
          return
        }

        setThesis(newThesis)
      },
      access,
    }
  }, [thesis, thesisId, user])

  if (requireLoadedThesis) {
    if (thesis === false) {
      return <NotFound />
    }

    if (thesis === undefined) {
      return <PageLoader />
    }
  }

  return (
    <ThesisContext.Provider value={contextState} key={thesisId}>
      {children}
    </ThesisContext.Provider>
  )
}

export default ThesisProvider
