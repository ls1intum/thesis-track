import { DataTable } from 'mantine-datatable'
import { ActionIcon, Center, Grid, Modal, Stack, Title } from '@mantine/core'
import React, { useEffect, useState } from 'react'
import { PaginationResponse } from '../../../../requests/responses/pagination'
import { IPublishedThesis } from '../../../../requests/responses/thesis'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { doRequest } from '../../../../requests/request'
import { showSimpleError } from '../../../../utils/notification'
import { getApiResponseErrorMessage } from '../../../../requests/handler'
import AuthenticatedFilePreview from '../../../../components/AuthenticatedFilePreview/AuthenticatedFilePreview'
import { formatDate, formatUser } from '../../../../utils/format'
import DocumentEditor from '../../../../components/DocumentEditor/DocumentEditor'
import LabeledItem from '../../../../components/LabeledItem/LabeledItem'
import { Eye } from 'phosphor-react'

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
        withTableBorder
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
            accessor: 'students',
            title: 'Student',
            render: (thesis) =>
              thesis.students
                .map((user) => formatUser(user, { withUniversityId: false }))
                .join(', '),
          },
          {
            accessor: 'advisors',
            title: 'Advisor',
            render: (thesis) =>
              thesis.advisors
                .map((user) => formatUser(user, { withUniversityId: false }))
                .join(', '),
          },
          {
            accessor: 'title',
            title: 'Title',
            ellipsis: true,
            width: 350,
          },
          {
            accessor: 'actions',
            title: 'Actions',
            textAlign: 'center',
            render: () => <Center><ActionIcon><Eye /></ActionIcon></Center>
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
            <Grid>
              <Grid.Col span={{ md: 4 }}>
                <LabeledItem
                  label='Supervisor'
                  value={openedThesis.supervisors
                    .map((user) => formatUser(user, { withUniversityId: false }))
                    .join(', ')}
                />
              </Grid.Col>
              <Grid.Col span={{ md: 4 }}>
                <LabeledItem
                  label='Advisor'
                  value={openedThesis.advisors
                    .map((user) => formatUser(user, { withUniversityId: false }))
                    .join(', ')}
                />
              </Grid.Col>
              <Grid.Col span={{ md: 4 }}>
                <LabeledItem
                  label='Student'
                  value={openedThesis.students
                    .map((user) => formatUser(user, { withUniversityId: false }))
                    .join(', ')}
                />
              </Grid.Col>
              <Grid.Col span={{ md: 4 }}>
                <LabeledItem
                  label='Start Date'
                  value={formatDate(openedThesis.startDate, { withTime: false })}
                />
              </Grid.Col>
              <Grid.Col span={{ md: 4 }}>
                <LabeledItem
                  label='End Date'
                  value={formatDate(openedThesis.endDate, { withTime: false })}
                />
              </Grid.Col>
            </Grid>
            <DocumentEditor label='Abstract' value={openedThesis.abstractText} />
            <AuthenticatedFilePreview
              url={`/v2/published-theses/${openedThesis.thesisId}/thesis`}
              height={500}
              filename={`${openedThesis.title.replaceAll(' ', '-')}.pdf`}
            />
          </Stack>
        )}
      </Modal>
    </Stack>
  )
}

export default PublishedTheses
