import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { doRequest } from '../../requests/request'
import { Pageable } from '../../requests/responses/pageable'
import { showSimpleError } from '../../utils/notification'
import { ITopic } from '../../requests/responses/topic'
import { ITopicsContext, TopicsContext } from './context'

interface ITopicsProviderProps {
  includeClosedTopics?: boolean
  limit?: number
  hideIfEmpty?: boolean
}

const TopicsProvider = (props: PropsWithChildren<ITopicsProviderProps>) => {
  const { children, includeClosedTopics = false, limit = 50, hideIfEmpty = false } = props

  const [topics, setTopics] = useState<Pageable<ITopic>>()
  const [page, setPage] = useState(0)

  useEffect(() => {
    setTopics(undefined)

    return doRequest<Pageable<ITopic>>(
      `/v2/topics`,
      {
        method: 'GET',
        requiresAuth: false,
        params: {
          page,
          limit,
          includeClosed: includeClosedTopics ? 'true' : 'false',
        },
      },
      (res) => {
        if (!res.ok) {
          showSimpleError(`Could not fetch topics: ${res.status}`)

          return setTopics({
            content: [],
            totalPages: 0,
            totalElements: 0,
            last: true,
            pageNumber: 0,
            pageSize: limit,
          })
        }

        setTopics(res.data)
      },
    )
  }, [includeClosedTopics, page, limit])

  const contextState = useMemo<ITopicsContext>(() => {
    return {
      topics,
      page,
      setPage,
      limit,
      updateTopic: (newThesis) => {
        setTopics((prev) => {
          if (!prev) {
            return undefined
          }

          const index = prev.content.findIndex((x) => x.topicId === newThesis.topicId)

          if (index >= 0) {
            prev.content[index] = newThesis
          }

          return { ...prev }
        })
      },
    }
  }, [topics, page, limit])

  if (hideIfEmpty && page === 0 && (!topics || topics.content.length === 0)) {
    return <></>
  }

  return <TopicsContext.Provider value={contextState}>{children}</TopicsContext.Provider>
}

export default TopicsProvider
