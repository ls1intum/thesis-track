import { DataTable } from 'mantine-datatable'
import { ActionIcon, Anchor, Center, Group, Modal, Stack, Title } from '@mantine/core'
import React, { useEffect, useState } from 'react'
import { PaginationResponse } from '../../../../requests/responses/pagination'
import { IPublishedThesis } from '../../../../requests/responses/thesis'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { doRequest } from '../../../../requests/request'
import { showSimpleError } from '../../../../utils/notification'
import { getApiResponseErrorMessage } from '../../../../requests/handler'
import AuthenticatedFilePreview from '../../../../components/AuthenticatedFilePreview/AuthenticatedFilePreview'
import { DownloadSimple, Eye } from 'phosphor-react'
import ThesisData from '../../../../components/ThesisData/ThesisData'
import AvatarUserList from '../../../../components/AvatarUserList/AvatarUserList'
import { formatThesisType } from '../../../../utils/format'
import { GLOBAL_CONFIG } from '../../../../config/global'

const PublishedTheses = () => {
  const [bodyRef] = useAutoAnimate<HTMLTableSectionElement>()

  const [page, setPage] = useState(0)
  const limit = 10

  const [theses, setTheses] = useState<PaginationResponse<IPublishedThesis>>()
  const [openedThesis, setOpenedThesis] = useState<IPublishedThesis>()

  useEffect(() => {
    return doRequest<PaginationResponse<IPublishedThesis>>(
      '/v2/published-theses',
      {
        method: 'GET',
        requiresAuth: false,
        params: {
          page,
          limit,
        },
      },
      (response) => {
        if (response.ok) {
          setTheses(response.data)
        } else {
          showSimpleError(getApiResponseErrorMessage(response))
        }
      },
    )
  }, [page, limit])

  if (page === 0 && !theses?.content.length) {
    return null
  }

  return (
    <Stack gap='xs'>
      <Title order={2}>Published Theses</Title>
      <DataTable
        fetching={!theses}
        withTableBorder={false}
        minHeight={200}
        noRecordsText='No theses published yet'
        borderRadius='sm'
        verticalSpacing='md'
        striped
        highlightOnHover
        totalRecords={theses?.totalElements ?? 0}
        recordsPerPage={limit}
        page={page + 1}
        onPageChange={(x) => setPage(x - 1)}
        bodyRef={bodyRef}
        records={theses?.content}
        idAccessor='thesisId'
        columns={[
          {
            accessor: 'title',
            title: 'Title',
            cellsStyle: () => ({ minWidth: 200 }),
          },
          {
            accessor: 'type',
            title: 'Type',
            ellipsis: true,
            width: 140,
            render: (thesis: IPublishedThesis) => formatThesisType(thesis.type),
          },
          {
            accessor: 'students',
            title: 'Student(s)',
            ellipsis: true,
            width: 180,
            render: (thesis) => <AvatarUserList users={thesis.students} />,
          },
          {
            accessor: 'advisors',
            title: 'Advisor(s)',
            ellipsis: true,
            width: 180,
            render: (thesis) => <AvatarUserList users={thesis.advisors} />,
          },
          {
            accessor: 'actions',
            title: 'Actions',
            textAlign: 'center',
            width: 100,
            render: (thesis) => (
              <Center>
                <Group gap='xs' onClick={(e) => e.stopPropagation()} wrap='nowrap'>
                  <ActionIcon onClick={() => setOpenedThesis(thesis)}>
                    <Eye />
                  </ActionIcon>
                  <ActionIcon
                    component={Anchor<'a'>}
                    href={`${GLOBAL_CONFIG.server_host}/api/v2/published-theses/${thesis.thesisId}/thesis`}
                    target='_blank'
                  >
                    <DownloadSimple />
                  </ActionIcon>
                </Group>
              </Center>
            ),
          },
        ]}
        onRowClick={({ record }) => setOpenedThesis(record)}
      />
      <Modal
        title={openedThesis?.title}
        opened={!!openedThesis}
        onClose={() => setOpenedThesis(undefined)}
        size='xl'
      >
        {openedThesis && (
          <Stack gap='md'>
            <ThesisData thesis={openedThesis} additionalInformation={['abstract']} />
            <AuthenticatedFilePreview
              url={`/v2/published-theses/${openedThesis.thesisId}/thesis`}
              includeLink
              height={500}
              filename={`${openedThesis.title.toLowerCase().replaceAll(' ', '-')}.pdf`}
            />
          </Stack>
        )}
      </Modal>
    </Stack>
  )
}

export default PublishedTheses
