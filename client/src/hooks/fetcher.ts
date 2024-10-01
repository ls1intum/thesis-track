import { IThesis } from '../requests/responses/thesis'
import { useEffect, useState } from 'react'
import { doRequest } from '../requests/request'
import { showSimpleError } from '../utils/notification'
import { getApiResponseErrorMessage } from '../requests/handler'
import { ITopic } from '../requests/responses/topic'
import { PaginationResponse } from '../requests/responses/pagination'

export function useThesis(thesisId: string | undefined) {
  const [thesis, setThesis] = useState<IThesis | false>()

  useEffect(() => {
    setThesis(thesisId ? undefined : false)

    if (thesisId) {
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
    }
  }, [thesisId])

  return thesis
}

export function useTopic(topicId: string | undefined) {
  const [topic, setTopic] = useState<ITopic | false>()

  useEffect(() => {
    setTopic(topicId ? undefined : false)

    if (topicId) {
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
    }
  }, [topicId])

  return topic
}

export function useApiPdfFile(
  url: string | undefined,
  filename: string,
  onLoad: (data: File | undefined) => unknown,
) {
  useEffect(() => {
    onLoad(undefined)

    if (url) {
      return doRequest<Blob>(
        url,
        {
          method: 'GET',
          requiresAuth: true,
          responseType: 'blob',
        },
        (response) => {
          if (response.ok) {
            onLoad(new File([response.data], filename, { type: 'application/pdf' }))
          } else {
            showSimpleError(getApiResponseErrorMessage(response))
          }
        },
      )
    }
  }, [url, filename])
}

export function useAllTopics() {
  const [topics, setTopics] = useState<ITopic[]>()

  useEffect(() => {
    setTopics(undefined)

    return doRequest<PaginationResponse<ITopic>>(
      `/v2/topics`,
      {
        method: 'GET',
        requiresAuth: false,
        params: {
          limit: 1000,
          includeClosed: 'false',
        },
      },
      (res) => {
        if (!res.ok) {
          showSimpleError(getApiResponseErrorMessage(res))
        }

        setTopics(res.ok ? res.data.content : [])
      },
    )
  }, [])

  return topics
}
