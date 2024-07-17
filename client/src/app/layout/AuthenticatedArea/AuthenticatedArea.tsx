import { ReactNode } from 'react'
import { AppShell, Burger } from '@mantine/core'
import * as styles from './AuthenticatedArea.module.scss'
import { Link, useLocation } from 'react-router-dom'
import { useDisclosure } from '@mantine/hooks'
import {
  FolderSimplePlus,
  Kanban,
  NewspaperClipping,
  PaperPlaneTilt,
  Scroll,
  SignOut,
  User,
} from 'phosphor-react'

interface IAuthenticatedAreaProps {
  children: ReactNode
}

const links = [
  { link: '/dashboard', label: 'Dashboard', icon: NewspaperClipping },
  { link: '/submit-application/pick-topic', label: 'Submit Application', icon: PaperPlaneTilt },
  { link: '/applications', label: 'Manage Applications', icon: Scroll },
  { link: '/topics/create', label: 'Create Topic', icon: FolderSimplePlus },
  { link: '/theses', label: 'Thesis Overview', icon: Kanban },
]

const AuthenticatedArea = (props: IAuthenticatedAreaProps) => {
  const { children } = props

  const [opened, { toggle }] = useDisclosure()
  const location = useLocation()

  return (
    <AppShell
      header={{ height: { sm: 60, md: 0 } }}
      navbar={{
        width: 300,
        breakpoint: 'md',
        collapsed: { mobile: !opened },
      }}
      padding='md'
    >
      <AppShell.Header>
        <Burger opened={opened} onClick={toggle} hiddenFrom='md' size='md' />
      </AppShell.Header>

      <AppShell.Navbar p='md'>
        <AppShell.Section grow my='md'>
          {links.map((item) => (
            <Link
              className={styles.link}
              data-active={location.pathname.startsWith(item.link) || undefined}
              key={item.label}
              to={item.link}
            >
              <item.icon className={styles.linkIcon} size={32} />
              <span>{item.label}</span>
            </Link>
          ))}
        </AppShell.Section>
        <AppShell.Section>
          <Link to='/settings/my-information' className={styles.link}>
            <User className={styles.linkIcon} size={32} />
            <span>My Information</span>
          </Link>

          <Link to='/logout' className={styles.link}>
            <SignOut className={styles.linkIcon} size={32} />
            <span>Logout</span>
          </Link>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  )
}

export default AuthenticatedArea
