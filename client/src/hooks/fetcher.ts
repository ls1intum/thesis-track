import { IThesis } from '../requests/responses/thesis'
import { useEffect, useState } from 'react'
import { doRequest } from '../requests/request'
import { showSimpleError } from '../utils/notification'
import { getApiResponseErrorMessage } from '../requests/handler'

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
        if (!res.ok) {
          showSimpleError(getApiResponseErrorMessage(res))
        }

        setThesis(res.ok ? res.data : false)
      },
    )
  }, [thesisId])

  return thesis
}
