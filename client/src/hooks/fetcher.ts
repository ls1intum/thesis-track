import { IThesis } from '../requests/responses/thesis'
import { useEffect, useState } from 'react'
import { doRequest } from '../requests/request'

export function useThesis(thesisId: string | undefined) {
  const [thesis, setThesis] = useState<IThesis | false>()

  useEffect(() => {
    setThesis(undefined)

    return doRequest<IThesis>(
      `/v2/theses/${thesisId}`,
      {
        method: 'GET',
        requiresAuth: true,
      },
      (res) => {
        setThesis(res.ok ? res.data : false)
      },
    )
  }, [thesisId])

  return thesis
}
