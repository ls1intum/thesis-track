import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { doRequest } from '../../requests/request'
import { showSimpleError } from '../../utils/notification'
import { ITopic } from '../../requests/responses/topic'
import { ITopicsContext, TopicsContext } from './context'
import { PaginationResponse } from '../../requests/responses/pagination'

interface ITopicsProviderProps {
  includeClosedTopics?: boolean
  limit?: number
  hideIfEmpty?: boolean
}

const TopicsProvider = (props: PropsWithChildren<ITopicsProviderProps>) => {
  const { children, includeClosedTopics = false, limit = 50, hideIfEmpty = false } = props

  const [topics, setTopics] = useState<PaginationResponse<ITopic>>()
  const [page, setPage] = useState(0)

  useEffect(() => {
    setTopics(undefined)

    return doRequest<PaginationResponse<ITopic>>(
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
      updateTopic: (newTopic) => {
        setTopics((prev) => {
          if (!prev) {
            return undefined
          }

          const index = prev.content.findIndex((x) => x.topicId === newTopic.topicId)

          if (index >= 0) {
            prev.content[index] = newTopic
          }

          return { ...prev }
        })
      },
      addTopic: (newTopic) => {
        setTopics((prev) => {
          if (!prev) {
            return undefined
          }

          prev.content = [newTopic, ...prev.content].slice(-limit)
          prev.totalElements += 1
          prev.totalPages = Math.ceil(prev.totalElements / limit)

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
