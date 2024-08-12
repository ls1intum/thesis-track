import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { IThesis, IThesisComment } from '../../requests/responses/thesis'
import { IThesisCommentsContext, ThesisCommentsContext } from './context'
import { PaginationResponse } from '../../requests/responses/pagination'
import { doRequest } from '../../requests/request'
import { showSimpleError } from '../../utils/notification'

interface IThesisCommentsProviderProps {
  thesis: IThesis
  commentType: 'THESIS' | 'ADVISOR'
  limit?: number
}

const ThesisCommentsProvider = (props: PropsWithChildren<IThesisCommentsProviderProps>) => {
  const { children, thesis, commentType, limit = 10 } = props

  const [submitting, setSubmitting] = useState(false)
  const [page, setPage] = useState(0)
  const [comments, setComments] = useState<PaginationResponse<IThesisComment>>()

  useEffect(() => {
    setComments(undefined)

    return doRequest<PaginationResponse<IThesisComment>>(
      `/v2/theses/${thesis.thesisId}/comments`,
      {
        method: 'GET',
        requiresAuth: true,
        params: {
          page,
          limit,
          commentType,
        },
      },
      (res) => {
        if (res.ok) {
          setComments({
            ...res.data,
            content: res.data.content.reverse(),
          })
        } else {
          setComments({
            content: [],
            totalPages: 0,
            totalElements: 0,
            last: true,
            pageNumber: 0,
            pageSize: limit,
          })
        }
      },
    )
  }, [thesis.thesisId, commentType, page, limit])

  const contextState = useMemo<IThesisCommentsContext>(() => {
    return {
      thesis,
      comments,
      posting: submitting,
      limit,
      page,
      setPage,
      postComment: async (message: string, file: File | undefined) => {
        setSubmitting(true)

        try {
          const formData = new FormData()
          formData.append(
            'data',
            new Blob(
              [
                JSON.stringify({
                  message,
                  commentType,
                }),
              ],
              { type: 'application/json' },
            ),
          )

          if (file) {
            formData.append('file', file)
          }

          const response = await doRequest<IThesisComment>(
            `/v2/theses/${thesis.thesisId}/comments`,
            {
              method: 'POST',
              requiresAuth: true,
              formData,
            },
          )

          if (response.ok) {
            setComments((prev) => {
              if (!prev) {
                return prev
              }

              if (prev.pageNumber > 0) {
                return prev
              }

              return {
                ...prev,
                content: [...prev.content, response.data].slice(-limit),
                totalElements: prev.totalElements + 1,
                totalPages: Math.ceil((prev.totalElements + 1) / limit),
              }
            })
          } else {
            showSimpleError(`Could not post comment: ${response.status}`)
          }
        } finally {
          setSubmitting(false)
        }
      },
      deleteComment: async (comment: IThesisComment) => {
        const response = await doRequest(
          `/v2/theses/${thesis.thesisId}/comments/${comment.commentId}`,
          {
            method: 'DELETE',
            requiresAuth: true,
          },
        )

        if (response.ok) {
          setComments((prev) => {
            if (!prev) {
              return prev
            }

            return {
              ...prev,
              content: prev.content.filter((c) => c.commentId !== comment.commentId),
              totalElements: prev.totalElements - 1,
              totalPages: Math.ceil((prev.totalElements - 1) / limit),
            }
          })
        } else {
          showSimpleError(`Could not delete comment: ${response.status}`)
        }
      },
    }
  }, [thesis, comments, submitting, commentType, limit, page])

  return (
    <ThesisCommentsContext.Provider value={contextState} key={thesis.thesisId}>
      {children}
    </ThesisCommentsContext.Provider>
  )
}

export default ThesisCommentsProvider
