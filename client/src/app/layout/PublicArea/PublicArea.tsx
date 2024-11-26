import React, { PropsWithChildren, ReactNode } from 'react'
import Footer from '../../../components/Footer/Footer'
import { Link, useNavigate } from 'react-router'
import { CaretLeft } from 'phosphor-react'
import { Anchor, MantineSize } from '@mantine/core'
import ContentContainer from '../ContentContainer/ContentContainer'
import ScrollToTop from '../ScrollToTop/ScrollToTop'
import * as classes from './PublicArea.module.css'

interface IPublicAreaProps {
  size?: MantineSize
  withBackButton?: boolean
  hero?: ReactNode
}

const PublicArea = (props: PropsWithChildren<IPublicAreaProps>) => {
  const { withBackButton = false, size = 'md', hero, children } = props

  const navigate = useNavigate()

  return (
    <div>
      <div className={classes.mainHeight}>
        {hero}
        <ContentContainer size={size}>
          {withBackButton && (
            <Anchor
              component={Link}
              c='dimmed'
              fz='xs'
              to='/'
              onClick={(e) => {
                e.preventDefault()
                navigate(-1)
              }}
            >
              <CaretLeft size={10} /> Back
            </Anchor>
          )}
          {children}
        </ContentContainer>
      </div>
      <Footer size={size} />
      <ScrollToTop />
    </div>
  )
}

export default PublicArea
