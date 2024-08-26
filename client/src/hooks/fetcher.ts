import { IThesis } from '../requests/responses/thesis'
import { useEffect, useState } from 'react'
import { doRequest } from '../requests/request'
import { showSimpleError } from '../utils/notification'
import { getApiResponseErrorMessage } from '../requests/handler'
import { ITopic } from '../requests/responses/topic'

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

export function useTopic(topicId: string | undefined) {
  const [topic, setTopic] = useState<ITopic | false>()

  useEffect(() => {
    setTopic(undefined)

    return doRequest<ITopic>(
      `/v2/topics/${topicId}`,
      {
        method: 'GET',
        requiresAuth: false,
      },
      (res) => {
        if (!res.ok) {
          showSimpleError(getApiResponseErrorMessage(res))
        }

        setTopic(res.ok ? res.data : false)
      },
    )
  }, [topicId])

  return topic
}
