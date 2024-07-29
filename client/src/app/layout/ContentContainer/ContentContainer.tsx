import { PropsWithChildren } from 'react'
import { Container } from '@mantine/core'

import * as styles from './ContentContainer.module.scss'

interface IContentContainerProps {
  size?: 'xl'
}

const ContentContainer = (props: PropsWithChildren<IContentContainerProps>) => {
  const { size, children } = props

  return (
    <Container className={styles.contentContainer} size={size}>
      {children}
    </Container>
  )
}

export default ContentContainer
