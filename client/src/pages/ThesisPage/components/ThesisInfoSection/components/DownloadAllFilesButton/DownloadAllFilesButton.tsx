import { Button } from '@mantine/core'
import React, { useMemo, useState } from 'react'
import { useLoadedThesisContext } from '../../../../../../providers/ThesisProvider/hooks'
import { formatThesisFilename } from '../../../../../../utils/format'
import { GLOBAL_CONFIG } from '../../../../../../config/global'
import { doRequest } from '../../../../../../requests/request'
import { showSimpleError } from '../../../../../../utils/notification'
import { getApiResponseErrorMessage } from '../../../../../../requests/handler'
import JSZip from 'jszip'
import { downloadFile } from '../../../../../../utils/blob'
import { IThesisComment } from '../../../../../../requests/responses/thesis'
import { PaginationResponse } from '../../../../../../requests/responses/pagination'

const DownloadAllFilesButton = () => {
  const { thesis, access } = useLoadedThesisContext()

  const [loading, setLoading] = useState(false)

  const files = useMemo(() => {
    const data: Array<{
      url: string
      filename: string
    }> = []

    if (thesis.proposals.length > 0) {
      data.push({
        url: `/v2/theses/${thesis.thesisId}/proposal/${thesis.proposals[0].proposalId}`,
        filename: formatThesisFilename(thesis, 'Proposal', thesis.proposals[0].filename, 0),
      })
    }

    const thesisFile = thesis.files.find((file) => file.type === 'THESIS')

    if (thesisFile) {
      data.push({
        url: `/v2/theses/${thesis.thesisId}/files/${thesisFile.fileId}`,
        filename: formatThesisFilename(thesis, 'Thesis', thesisFile.filename, 0),
      })
    }

    for (const [key, value] of Object.entries(GLOBAL_CONFIG.thesis_files)) {
      const file = thesis.files.find((row) => row.type === key)

      if (file) {
        data.push({
          url: `/v2/theses/${thesis.thesisId}/files/${file.fileId}`,
          filename: formatThesisFilename(thesis, value.label, file.filename, 0),
        })
      }
    }

    if (thesis.assessment) {
      data.push({
        url: `/v2/theses/${thesis.thesisId}/assessment`,
        filename: formatThesisFilename(thesis, 'Assessment', 'assessment.pdf', 0),
      })
    }

    return data
  }, [thesis])

  const onDownload = async () => {
    setLoading(true)

    try {
      const zip = new JSZip()

      const fileRequests = files.map((item) => ({ ...item, zip }))

      const commentsZip = zip.folder('comments')
      const commentTypes = access.advisor ? ['THESIS', 'ADVISOR'] : ['THESIS']

      for (const commentType of commentTypes) {
        const response = await doRequest<PaginationResponse<IThesisComment>>(
          `/v2/theses/${thesis.thesisId}/comments`,
          {
            method: 'GET',
            requiresAuth: true,
            params: {
              page: 0,
              limit: 1000,
              commentType,
            },
          },
        )

        if (response.ok) {
          for (const comment of response.data.content) {
            if (!comment.uploadName || !commentsZip) {
              continue
            }

            fileRequests.push({
              url: `/v2/theses/${thesis.thesisId}/comments/${comment.commentId}/file`,
              filename: comment.uploadName,
              zip: commentsZip,
            })
          }
        } else {
          return showSimpleError(getApiResponseErrorMessage(response))
        }
      }

      for (const item of fileRequests) {
        const response = await doRequest<Blob>(item.url, {
          method: 'GET',
          requiresAuth: true,
          responseType: 'blob',
        })

        if (response.ok) {
          const file = new File([response.data], item.filename, {
            type: 'application/octet-stream',
          })

          item.zip.file(item.filename, file)
        } else {
          return showSimpleError(getApiResponseErrorMessage(response))
        }
      }

      const zipFile = new File(
        [await zip.generateAsync({ type: 'blob' })],
        formatThesisFilename(thesis, '', 'files.zip', 0),
      )

      downloadFile(zipFile)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant='outline' onClick={onDownload} loading={loading}>
      Download All Files
    </Button>
  )
}

export default DownloadAllFilesButton
