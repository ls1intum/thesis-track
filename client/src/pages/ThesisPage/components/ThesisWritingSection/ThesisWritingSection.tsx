import { IThesis } from '../../../../requests/responses/thesis'
import { IThesisAccessPermissions } from '../../types'
import { useState } from 'react'
import { Accordion } from '@mantine/core'

interface IThesisWritingSectionProps {
  thesis: IThesis
  access: IThesisAccessPermissions
  onUpdate: (thesis: IThesis) => unknown
}

const ThesisWritingSection = (props: IThesisWritingSectionProps) => {
  const {} = props

  const [opened, setOpened] = useState(true)

  return (
    <Accordion
      variant='contained'
      value={opened ? 'open' : ''}
      onChange={(value) => setOpened(value === 'open')}
    >
      <Accordion.Item value='open'>
        <Accordion.Control>Thesis</Accordion.Control>
        <Accordion.Panel></Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default ThesisWritingSection
