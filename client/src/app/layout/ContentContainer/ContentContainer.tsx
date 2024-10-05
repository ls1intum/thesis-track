import { PropsWithChildren } from 'react'
import { Container, MantineSize } from '@mantine/core'

interface IContentContainerProps {
  size?: MantineSize
}

const ContentContainer = (props: PropsWithChildren<IContentContainerProps>) => {
  const { size, children } = props

  return (
    <Container my='md' size={size} fluid={!size}>
      {children}
    </Container>
  )
}

export default ContentContainer
