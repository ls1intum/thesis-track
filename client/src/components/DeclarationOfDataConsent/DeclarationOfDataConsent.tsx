import { Anchor, Modal, Text, Title } from '@mantine/core'
import { useState } from 'react'

interface IDeclarationOfDataConsentProps {
  text: string
}

export const DeclarationOfDataConsent = (props: IDeclarationOfDataConsentProps) => {
  const { text } = props

  const [opened, setOpened] = useState(false)

  return (
    <>
      <Anchor onClick={() => setOpened(true)}>{text}</Anchor>
      <Modal opened={opened} onClose={() => setOpened(false)}>
        <Title ta='center'>Data Consent</Title>
        <Text c='dimmed' fz='sm'>
          The data collected here will only be used for the developer application process of the
          iPraktikum practical course. Only the lecturers have access to the personal data. <br />
          <br />
          Consequences in the absence of consent: <br />
          <br /> You have the right not to agree to this declaration of consent - however, since the
          data marked as mandatory fields are required to apply as a developer, we cannot complete
          your registration without your consent. <br />
          <br />
          Your rights: <br />- a right to information <br />- a right to correction or deletion or
          restriction of processing or a right to object to processing <br />- a right to data
          portability <br />- there is also a right of appeal to the Bavarian State Commissioner for
          Data Protection <br />
          <br />
          Consequences of withdrawing consent:
          <br />
          <br /> As soon as the cancellation notice is received, your data may not be processed
          further and will be deleted immediately. Withdrawing your consent does not affect the
          legality of the processing carried out up to that point. Please send your cancellation to
          the address below.
          <br />
          <br />
          Krusche, Stephan, Technische Universität München, Institut für Informatik I1,
          Boltzmannstraße 3, 85748 Garching b. München, +49 (89) 289-18212, ios@in.tum.de <br />
          For further questions concerning data protection, please contact: www.datenschutz.tum.de
        </Text>
      </Modal>
    </>
  )
}
