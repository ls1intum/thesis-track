import { PropsWithChildren } from 'react'
import { Container } from '@mantine/core'

import * as styles from './ContentContainer.module.scss'

interface IContentContainerProps {}

const ContentContainer = (props: PropsWithChildren<IContentContainerProps>) => {
  const { children } = props

  return <Container className={styles.contentContainer}>{children}</Container>
}

export default ContentContainer
