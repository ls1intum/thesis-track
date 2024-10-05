import React, { PropsWithChildren } from 'react'
import Footer from './components/Footer/Footer'
import { Link } from 'react-router-dom'
import { CaretLeft } from 'phosphor-react'
import { Anchor, MantineSize } from '@mantine/core'
import ContentContainer from '../ContentContainer/ContentContainer'
import ScrollToTop from '../ScrollToTop/ScrollToTop'

interface IPublicAreaProps {
  withBackButton?: boolean
  size?: MantineSize
}

const PublicArea = (props: PropsWithChildren<IPublicAreaProps>) => {
  const { withBackButton = false, size = 'md', children } = props

  return (
    <div>
      <ContentContainer size={size}>
        {withBackButton && (
          <Anchor component={Link} c='dimmed' fz='xs' to='/'>
            <CaretLeft size={10} /> Back
          </Anchor>
        )}
        {children}
      </ContentContainer>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

export default PublicArea
