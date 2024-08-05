import { IThesis } from '../../../../requests/responses/thesis'
import { IThesisAccessPermissions } from '../../types'
import { useState } from 'react'
import { Accordion } from '@mantine/core'

interface IThesisAssessmentSectionProps {
  thesis: IThesis
  access: IThesisAccessPermissions
  onUpdate: (thesis: IThesis) => unknown
}

const ThesisAssessmentSection = (props: IThesisAssessmentSectionProps) => {
  const {} = props

  const [opened, setOpened] = useState(true)

  return (
    <Accordion
      variant='contained'
      value={opened ? 'open' : ''}
      onChange={(value) => setOpened(value === 'open')}
    >
      <Accordion.Item value='open'>
        <Accordion.Control>Assessment</Accordion.Control>
        <Accordion.Panel></Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default ThesisAssessmentSection
