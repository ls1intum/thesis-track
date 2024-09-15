import { useParams } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { IPublishedPresentation } from '../../requests/responses/thesis'
import { doRequest } from '../../requests/request'
import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import ThesisData from '../../components/ThesisData/ThesisData'
import { showSimpleError } from '../../utils/notification'
import { getApiResponseErrorMessage } from '../../requests/handler'
import NotFound from '../../components/NotFound/NotFound'
import PageLoader from '../../components/PageLoader/PageLoader'
import { Anchor, Divider, Grid, Stack, Title } from '@mantine/core'
import LabeledItem from '../../components/LabeledItem/LabeledItem'
import { formatDate, formatPresentationType } from '../../utils/format'
import { GLOBAL_CONFIG } from '../../config/global'

const PresentationPage = () => {
  const { presentationId } = useParams<{ presentationId: string }>()

  const [presentation, setPresentation] = useState<IPublishedPresentation | false>()

  useEffect(() => {
    setPresentation(undefined)

    if (presentationId) {
      return doRequest<IPublishedPresentation>(
        `/v2/published-presentations/${presentationId}`,
        {
          method: 'GET',
          requiresAuth: false,
        },
        (res) => {
          if (res.ok) {
            setPresentation(res.data)
          } else {
            setPresentation(false)

            showSimpleError(getApiResponseErrorMessage(res))
          }
        },
      )
    }
  }, [presentationId])

  if (presentation === false) {
    return <NotFound />
  }

  if (!presentation) {
    return <PageLoader />
  }

  return (
    <ContentContainer size='md'>
      <Stack gap='md'>
        <Title>{presentation.thesis.title}</Title>
        <Grid>
          <Grid.Col span={{ md: 4 }}>
            <LabeledItem label='Presentation Date' value={formatDate(presentation.scheduledAt)} />
          </Grid.Col>
          <Grid.Col span={{ md: 4 }}>
            <LabeledItem label='Location' value={presentation.location || 'Not available'} />
          </Grid.Col>
          <Grid.Col span={{ md: 4 }}>
            <LabeledItem
              label='Stream URL'
              value={
                presentation.streamUrl ? (
                  <Anchor target='_blank' href={presentation.streamUrl}>
                    {presentation.streamUrl}
                  </Anchor>
                ) : (
                  'Not available'
                )
              }
            />
          </Grid.Col>
          <Grid.Col span={{ md: 4 }}>
            <LabeledItem
              label='Language'
              value={GLOBAL_CONFIG.languages[presentation.language] ?? presentation.language}
            />
          </Grid.Col>
          <Grid.Col span={{ md: 4 }}>
            <LabeledItem label='Type' value={formatPresentationType(presentation.type)} />
          </Grid.Col>
        </Grid>
        <Divider />
        <ThesisData thesis={presentation.thesis} additionalInformation={['abstract']} />
      </Stack>
    </ContentContainer>
  )
}

export default PresentationPage
