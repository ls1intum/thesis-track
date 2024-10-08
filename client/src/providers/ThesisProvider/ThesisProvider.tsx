import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { IThesis } from '../../requests/responses/thesis'
import { useThesis } from '../../hooks/fetcher'
import { IThesisContext, ThesisContext } from './context'
import NotFound from '../../components/NotFound/NotFound'
import PageLoader from '../../components/PageLoader/PageLoader'
import { useThesisAccess } from './hooks'

interface IThesisProviderProps {
  thesisId: string | undefined
  requireLoadedThesis?: boolean
}

const ThesisProvider = (props: PropsWithChildren<IThesisProviderProps>) => {
  const { children, thesisId, requireLoadedThesis = false } = props

  const loadedThesis = useThesis(thesisId)

  const [thesis, setThesis] = useState<IThesis | undefined | false>(loadedThesis)

  useEffect(() => {
    setThesis(loadedThesis)
  }, [loadedThesis])

  const access = useThesisAccess(thesis)

  const contextState = useMemo<IThesisContext>(() => {
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
  }, [thesis, thesisId, access])

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
