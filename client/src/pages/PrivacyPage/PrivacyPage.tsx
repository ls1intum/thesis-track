import { Title } from '@mantine/core'
import { usePageTitle } from '../../hooks/theme'
import PublicArea from '../../app/layout/PublicArea/PublicArea'
import { useEffect, useState } from 'react'

const PrivacyPage = () => {
  usePageTitle('Privacy')

  const [content, setContent] = useState('')

  useEffect(() => {
    fetch('/privacy.html')
      .then((res) => res.text())
      .then((res) => setContent(res))
  }, [])

  return (
    <PublicArea withBackButton={true}>
      <Title mb='md'>Privacy</Title>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </PublicArea>
  )
}

export default PrivacyPage
