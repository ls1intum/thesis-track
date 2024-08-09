import { useContext, useState } from 'react'
import { ThesisContext } from './context'
import { IThesis } from '../../requests/responses/thesis'
import { showSimpleError, showSimpleSuccess } from '../../utils/notification'

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

export function useThesisUpdateAction(
  fn: (thesis: IThesis) => PromiseLike<IThesis>,
  successMessage?: string,
): [boolean, () => unknown] {
  const { thesis, updateThesis } = useThesisContext()

  const [loading, setLoading] = useState(false)

  return [
    loading,
    async () => {
      if (!thesis) {
        return
      }

      setLoading(true)
      try {
        updateThesis(await fn(thesis))

        if (successMessage) {
          showSimpleSuccess(successMessage)
        }
      } catch (e) {
        showSimpleError(String(e))
      } finally {
        setLoading(false)
      }
    },
  ]
}
