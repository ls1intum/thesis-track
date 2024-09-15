import { useContext, useMemo, useState } from 'react'
import { ThesisContext } from './context'
import { IPublishedThesis, IThesis } from '../../requests/responses/thesis'
import { showSimpleError, showSimpleSuccess } from '../../utils/notification'
import { useUser } from '../../hooks/authentication'

export function useThesisContext() {
  const data = useContext(ThesisContext)

  if (!data) {
    throw new Error('ThesisContext not initialized')
  }

  return data
}

export function useLoadedThesisContext() {
  const { thesis, access, updateThesis } = useThesisContext()

  if (!thesis) {
    throw new Error('Thesis not loaded')
  }

  return { thesis, access, updateThesis }
}

export function useThesisUpdateAction<T extends (...args: any[]) => any>(
  fn: (...args: Parameters<T>) => PromiseLike<IThesis>,
  successMessage?: string,
): [boolean, (...args: Parameters<T>) => unknown] {
  const { thesis, updateThesis } = useThesisContext()

  const [loading, setLoading] = useState(false)

  return [
    loading,
    async (...args: Parameters<T>) => {
      if (!thesis) {
        return
      }

      setLoading(true)
      try {
        updateThesis(await fn(...args))

        if (successMessage) {
          showSimpleSuccess(successMessage)
        }
      } catch (e) {
        if (e instanceof Error) {
          showSimpleError(e.message)
        } else {
          showSimpleError(String(e))
        }
      } finally {
        setLoading(false)
      }
    },
  ]
}

export function useThesisAccess(thesis: IThesis | IPublishedThesis | undefined | false) {
  const user = useUser()

  return useMemo(() => {
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

    return access
  }, [thesis, user])
}
