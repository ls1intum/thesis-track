import { PropsWithChildren } from 'react'
import { Container } from '@mantine/core'

interface IContentContainerProps {
  size?: 'xl'
  px?: string | number
}

const ContentContainer = (props: PropsWithChildren<IContentContainerProps>) => {
  const { size, px = 0, children } = props

  return (
    <Container my='md' px={px} size={size}>
      {children}
    </Container>
  )
}

export default ContentContainer
