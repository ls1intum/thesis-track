import { FunctionComponent, PropsWithChildren, ReactElement, Suspense, useEffect } from 'react'
import { AppShell, Burger, Center, Group, Loader } from '@mantine/core'
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
import { useIsSmallerBreakpoint } from '../../../hooks/theme'
import { useAuthenticationContext } from '../../../hooks/authentication'

export interface IAuthenticatedAreaProps {
  requireAuthentication?: boolean
  collapseNavigation?: boolean
  requiredRoles?: string[]
}

const links: Array<{
  link: string,
  label: string,
  icon: any,
  roles: string[] | undefined
}> = [
  { link: '/dashboard', label: 'Dashboard', icon: NewspaperClipping, roles: undefined },
  { link: '/submit-application/pick-topic', label: 'Submit Application', icon: PaperPlaneTilt, roles: undefined },
  { link: '/management/thesis-applications', label: 'Review Applications v1', icon: Scroll, roles: ['admin', 'advisor'] },
  { link: '/applications', label: 'Review Applications v2', icon: Scroll, roles: ['admin', 'advisor'] },
  { link: '/topics/create', label: 'Create Topic', icon: FolderSimplePlus, roles: ['admin', 'advisor'] },
  { link: '/theses', label: 'Thesis Overview', icon: Kanban, roles: ['admin'] },
]

const SpinningLoader = () => (
  <Center className={styles.fullHeight}>
    <Loader />
  </Center>
)

const AuthenticatedArea = (props: PropsWithChildren<IAuthenticatedAreaProps>) => {
  const { children, requireAuthentication = true, collapseNavigation = false, requiredRoles } = props

  const [opened, { toggle }] = useDisclosure()
  const location = useLocation()
  const showHeader = useIsSmallerBreakpoint('md') || collapseNavigation
  const auth = useAuthenticationContext()

  useEffect(() => {
    if (requireAuthentication && !auth.isAuthenticated) {
      auth.login()
    }
  }, [requireAuthentication, auth.isAuthenticated])

  if (!requireAuthentication && !auth.isAuthenticated) {
    return <>{children}</>
  }

  return (
    <AppShell
      header={{ collapsed: !showHeader, height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'md',
        collapsed: { mobile: !opened, desktop: !opened && collapseNavigation },
      }}
      padding='md'
    >
      <AppShell.Header>
        <Group h='100%' px='md'>
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom={collapseNavigation ? undefined : 'md'}
            size='md'
          />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p='md'>
        <AppShell.Section grow my='md'>
          {links
            .filter(item => !item.roles || item.roles.some(role => auth.user?.roles.includes(role)))
            .map((item) => (
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
          <Link
            to='/settings/my-information'
            className={styles.link}
            data-active={location.pathname.startsWith('/settings/my-information') || undefined}
          >
            <User className={styles.linkIcon} size={32} />
            <span>My Information</span>
          </Link>

          <Link to='/logout' className={styles.link}>
            <SignOut className={styles.linkIcon} size={32} />
            <span>Logout</span>
          </Link>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        {auth.user ? (
          <Suspense fallback={<SpinningLoader />}>
            {!requiredRoles || requiredRoles.some(role => auth.user?.roles.includes(role))
              ? children :
              (
                <Center className={styles.fullHeight}>
                  <h1>403 - Unauthorized</h1>
                </Center>
              )
            }
          </Suspense>
        ) : (
          <SpinningLoader />
        )}
      </AppShell.Main>
    </AppShell>
  )
}

export default AuthenticatedArea
