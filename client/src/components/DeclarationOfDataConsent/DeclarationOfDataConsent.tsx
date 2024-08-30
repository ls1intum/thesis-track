import { Anchor, Modal } from '@mantine/core'
import { useState } from 'react'
import DocumentEditor from '../DocumentEditor/DocumentEditor'
import { GLOBAL_CONFIG } from '../../config/global'

interface IDeclarationOfDataConsentProps {
  text: string
}

export const DeclarationOfDataConsent = (props: IDeclarationOfDataConsentProps) => {
  const { text } = props

  const [opened, setOpened] = useState(false)

  return (
    <>
      <Anchor onClick={() => setOpened(true)}>{text}</Anchor>
      <Modal title='Data Consent' opened={opened} onClose={() => setOpened(false)}>
        <DocumentEditor value={GLOBAL_CONFIG.privacy_notice} />
      </Modal>
    </>
  )
}
