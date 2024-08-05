import React, { useEffect, useState } from 'react'
import { usePageTitle } from '../../hooks/theme'
import ThesisConfigSection from './components/ThesisConfigSection/ThesisConfigSection'
import ThesisInfoSection from './components/ThesisInfoSection/ThesisInfoSection'
import ThesisProposalSection from './components/ThesisProposalSection/ThesisProposalSection'
import ThesisWritingSection from './components/ThesisWritingSection/ThesisWritingSection'
import ThesisAssessmentSection from './components/ThesisAssessmentSection/ThesisAssessmentSection'
import ThesisFinalGradeSection from './components/ThesisFinalGradeSection/ThesisFinalGradeSection'
import { useThesis } from '../../hooks/fetcher'
import { useParams } from 'react-router-dom'
import NotFound from '../../components/NotFound/NotFound'
import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import PageLoader from '../../components/PageLoader/PageLoader'
import { Alert, Space, Title } from '@mantine/core'
import { useLoggedInUser } from '../../hooks/authentication'
import { IThesisAccessPermissions } from './types'
import { IThesis, ThesisState } from '../../requests/responses/thesis'
import { Info } from 'phosphor-react'

const ThesisPage = () => {
  const { thesisId } = useParams<{ thesisId: string }>()

  const initialThesis = useThesis(thesisId)
  const [thesis, setThesis] = useState<IThesis | undefined | false>(initialThesis)

  useEffect(() => {
    setThesis(initialThesis)
  }, [initialThesis])

  usePageTitle(thesis ? thesis.title : 'Thesis')

  const user = useLoggedInUser()

  if (thesis === false) {
    return <NotFound />
  }

  if (thesis === undefined) {
    return <PageLoader />
  }

  const access: IThesisAccessPermissions = {
    student:
      user.groups.includes('admin') ||
      thesis.advisors.some((advisor) => user.userId === advisor.userId) ||
      thesis.supervisors.some((supervisor) => user.userId === supervisor.userId) ||
      thesis.students.some((student) => user.userId === student.userId),
    advisor:
      user.groups.includes('admin') ||
      thesis.advisors.some((advisor) => user.userId === advisor.userId) ||
      thesis.supervisors.some((supervisor) => user.userId === supervisor.userId),
    supervisor:
      user.groups.includes('admin') ||
      thesis.supervisors.some((supervisor) => user.userId === supervisor.userId),
  }

  return (
    <ContentContainer>
      <Title>{thesis.title}</Title>
      <Space my='md' />
      {thesis.state === ThesisState.DROPPED_OUT && (
        <Alert variant='light' color='red' title='This thesis is closed' icon={<Info />} mb='md' />
      )}
      <ThesisConfigSection thesis={thesis} access={access} onUpdate={setThesis} />
      <Space my='md' />
      <ThesisInfoSection thesis={thesis} />
      <Space my='md' />
      <ThesisProposalSection thesis={thesis} />
      <Space my='md' />
      <ThesisWritingSection thesis={thesis} />
      <Space my='md' />
      <ThesisAssessmentSection thesis={thesis} />
      <Space my='md' />
      <ThesisFinalGradeSection thesis={thesis} />
    </ContentContainer>
  )
}

export default ThesisPage
