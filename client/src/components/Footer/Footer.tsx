import * as classes from './Footer.module.css'
import { Anchor, Container, Group, MantineSize } from '@mantine/core'
import { GLOBAL_CONFIG } from '../../config/global'
import { Link } from 'react-router'
import ColorSchemeToggleButton from '../ColorSchemeToggleButton/ColorSchemeToggleButton'
import packageJson from '../../../package.json'

const links = [
  { link: '/about', label: 'About', visible: true },
  { link: '/imprint', label: 'Imprint', visible: !!GLOBAL_CONFIG.imprint_text },
  { link: '/privacy', label: 'Privacy', visible: !!GLOBAL_CONFIG.privacy_text },
]

interface IFooterProps {
  size?: MantineSize
}

const Footer = (props: IFooterProps) => {
  const { size } = props

  const version = packageJson.version

  return (
    <div className={classes.footer}>
      <Container fluid={!size} size={size} className={classes.inner}>
        <Group>
          <Anchor href={GLOBAL_CONFIG.chair_url} target='_blank' c='dimmed'>
            {GLOBAL_CONFIG.chair_name}
          </Anchor>
          <Anchor
            href={`https://github.com/ls1intum/thesis-track/releases`}
            target='_blank'
            c='dimmed'
          >
            v{version}
          </Anchor>
        </Group>
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
