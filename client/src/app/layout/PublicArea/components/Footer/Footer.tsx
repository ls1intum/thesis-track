import * as classes from './Footer.module.css'
import { Anchor, Container, Group } from '@mantine/core'
import { GLOBAL_CONFIG } from '../../../../../config/global'
import { Link } from 'react-router-dom'
import ColorSchemeToggleButton from '../../../../../components/ColorSchemeToggleButton/ColorSchemeToggleButton'

const links = [
  { link: '/about', label: 'About', visible: true },
  { link: '/imprint', label: 'Imprint', visible: !!GLOBAL_CONFIG.imprint_text },
  { link: '/privacy', label: 'Privacy', visible: !!GLOBAL_CONFIG.privacy_text },
]

const Footer = () => {
  return (
    <div className={classes.footer}>
      <Container className={classes.inner}>
        <Anchor href={GLOBAL_CONFIG.chair_url} target='_blank' c='dimmed'>
          {GLOBAL_CONFIG.chair_name}
        </Anchor>
        <Group className={classes.links}>
          {links
            .filter((link) => link.visible)
            .map((link) => (
              <Anchor key={link.label} component={Link} c='dimmed' to={link.link}>
                {link.label}
              </Anchor>
            ))}
          <ColorSchemeToggleButton />
        </Group>
      </Container>
    </div>
  )
}

export default Footer
