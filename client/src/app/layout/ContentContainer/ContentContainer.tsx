import { PropsWithChildren } from 'react'
import { Container } from '@mantine/core'

interface IContentContainerProps {
  size?: 'xl' | 'md'
}

const ContentContainer = (props: PropsWithChildren<IContentContainerProps>) => {
  const { size, children } = props

  return (
    <Container my='md' size={size} style={{ minWidth: size ? undefined : '80%' }}>
      {children}
    </Container>
  )
}

export default ContentContainer
