import { ReactNode } from 'react'
import { Container } from '@mantine/core'

import * as styles from './ContentContainer.module.scss'

interface IContentContainerProps {
  children: ReactNode
}

const ContentContainer = (props: IContentContainerProps) => {
  const { children } = props

  return (
    <Container className={styles.contentContainer}>
      {children}
    </Container>
  )
}

export default ContentContainer
