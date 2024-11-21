import React, { PropsWithChildren, Suspense, useEffect } from 'react'
import {
  ActionIcon,
  AppShell,
  Burger,
  Center,
  Divider,
  Group,
  MantineSize,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core'
import * as classes from './AuthenticatedArea.module.css'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDebouncedValue, useDisclosure } from '@mantine/hooks'
import {
  CaretDoubleLeft,
  CaretDoubleRight,
  Kanban,
  NewspaperClipping,
  Scroll,
  SignOut,
  FolderSimplePlus,
  PaperPlaneTilt,
  Table,
  Presentation,
} from 'phosphor-react'
import { useIsSmallerBreakpoint } from '../../../hooks/theme'
import { useAuthenticationContext, useUser } from '../../../hooks/authentication'
import { useNavigationType } from 'react-router'
import ScrollToTop from '../ScrollToTop/ScrollToTop'
import PageLoader from '../../../components/PageLoader/PageLoader'
import { useLocalStorage } from '../../../hooks/local-storage'
import Logo from '../../../components/Logo/Logo'
import ColorSchemeToggleButton from '../../../components/ColorSchemeToggleButton/ColorSchemeToggleButton'
import CustomAvatar from '../../../components/CustomAvatar/CustomAvatar'
import { formatUser } from '../../../utils/format'
import ContentContainer from '../ContentContainer/ContentContainer'
import Footer from '../../../components/Footer/Footer'

export interface IAuthenticatedAreaProps {
  size?: MantineSize
  requireAuthentication?: boolean
  collapseNavigation?: boolean
  requiredGroups?: string[]
}

const links: Array<{
  link: string
  label: string
  icon: any
  groups: string[] | undefined
}> = [
  { link: '/dashboard', label: 'Dashboard', icon: NewspaperClipping, groups: undefined },
  {
    link: '/presentations',
    label: 'Presentations',
    icon: Presentation,
    groups: undefined,
  },
  {
    link: '/submit-application',
    label: 'Submit Application',
    icon: PaperPlaneTilt,
    groups: undefined,
  },
  {
    link: '/applications',
    label: 'Review Applications',
    icon: Scroll,
    groups: ['admin', 'advisor', 'supervisor'],
  },
  {
    link: '/topics',
    label: 'Manage Topics',
    icon: FolderSimplePlus,
    groups: ['admin', 'advisor', 'supervisor'],
  },
  {
    link: '/theses',
    label: 'Browse Theses',
    icon: Table,
    groups: undefined,
  },
  {
    link: '/overview',
    label: 'Theses Overview',
    icon: Kanban,
    groups: ['admin', 'advisor', 'supervisor'],
  },
]

const AuthenticatedArea = (props: PropsWithChildren<IAuthenticatedAreaProps>) => {
  const {
    children,
    size,
    requireAuthentication = true,
    collapseNavigation = false,
    requiredGroups,
  } = props

  const navigate = useNavigate()
  const user = useUser()
  const [opened, { toggle, close }] = useDisclosure()

  const minimizeAnimationDuration = 200
  const [minimizedState, setMinimized] = useLocalStorage<boolean>('navigation_minimized', {
    usingJson: true,
  })
  const [debouncedMinimized] = useDebouncedValue(
    collapseNavigation || minimizedState,
    minimizeAnimationDuration,
  )
  // only use debounced State if value is false because otherwise the text is formatted weirdly if you expand the navigation
  const minimized = opened ? false : minimizedState || !!debouncedMinimized

  const location = useLocation()
  const navigationType = useNavigationType()

  const showHeader = useIsSmallerBreakpoint('md')
  const auth = useAuthenticationContext()

  useEffect(() => {
    if (requireAuthentication && !auth.isAuthenticated) {
      auth.login()

      const interval = setInterval(() => {
        auth.login()
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [requireAuthentication, auth.isAuthenticated])

  useEffect(() => {
    if (navigationType === 'POP') {
      return
    }

    close()
  }, [location.pathname, navigationType])

  if (!requireAuthentication && !auth.isAuthenticated) {
    return (
      <ContentContainer size={size}>
        {children}
        <ScrollToTop />
      </ContentContainer>
    )
  }

  return (
    <AppShell
      header={{ collapsed: !showHeader, height: 60 }}
      navbar={{
        width: collapseNavigation || minimizedState ? 70 : 300,
        breakpoint: 'md',
        collapsed: { mobile: !opened, desktop: false },
      }}
      styles={{
        navbar: {
          transition: `width ${minimizeAnimationDuration}ms ease-in-out`,
        },
      }}
      padding={0}
    >
      <AppShell.Header>
        <Group h='100%' px='md'>
          <Burger opened={opened} onClick={toggle} hiddenFrom='md' size='md' />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p='md'>
        <AppShell.Section grow mb='md'>
          {!minimized && (
            <Group preventGrowOverflow={false}>
              <Logo className={classes.logo} />
              <Text
                className={classes.siteName}
                fw='bold'
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/')}
              >
                ThesisTrack
              </Text>
              <ColorSchemeToggleButton ml='auto' />
            </Group>
          )}
          {!minimized && <Divider my='sm' />}
          {minimized && (
            <Center mb='md'>
              <ColorSchemeToggleButton />
            </Center>
          )}
          {links
            .filter(
              (item) =>
                !item.groups || item.groups.some((role) => auth.user?.groups.includes(role)),
            )
            .map((item) => (
              <Link
                className={minimized ? classes.minimizedLink : classes.fullLink}
                data-active={location.pathname.startsWith(item.link) || undefined}
                key={item.label}
                to={item.link}
              >
                <Tooltip label={item.label} disabled={!minimized} position='right' offset={15}>
                  <item.icon className={classes.linkIcon} size={25} />
                </Tooltip>
                {!minimized && <span>{item.label}</span>}
              </Link>
            ))}
        </AppShell.Section>
        {user && (
          <AppShell.Section>
            <Link
              to='/settings'
              className={minimized ? classes.minimizedLink : classes.fullLink}
              data-active={location.pathname.startsWith('/settings') || undefined}
            >
              <Tooltip label='Settings' disabled={!minimized} position='right' offset={15}>
                <CustomAvatar
                  user={user}
                  size={minimized ? 18 : 32}
                  className={classes.linkAvatar}
                />
              </Tooltip>
              {!minimized && (
                <Stack gap={2}>
                  <Text size='sm'>{formatUser(user)}</Text>
                  <Text size='xs'>Settings</Text>
                </Stack>
              )}
            </Link>
            <Link to='/logout' className={minimized ? classes.minimizedLink : classes.fullLink}>
              <Tooltip label='Logout' disabled={!minimized} position='right' offset={15}>
                <SignOut className={classes.linkIcon} size={25} />
              </Tooltip>
              {!minimized && <span>Logout</span>}
            </Link>
            {!collapseNavigation && (
              <Group>
                <ActionIcon
                  visibleFrom='md'
                  ml='auto'
                  mr={minimized ? 'auto' : undefined}
                  variant='transparent'
                  onClick={() => setMinimized((prev) => !prev)}
                >
                  {minimized ? <CaretDoubleRight /> : <CaretDoubleLeft />}
                </ActionIcon>
              </Group>
            )}
          </AppShell.Section>
        )}
      </AppShell.Navbar>

      <AppShell.Main>
        <div className={classes.mainHeight}>
          {auth.user ? (
            <Suspense fallback={<PageLoader />}>
              {!requiredGroups ||
              requiredGroups.some((role) => auth.user?.groups.includes(role)) ? (
                <ContentContainer size={size}>{children}</ContentContainer>
              ) : (
                <Center className={classes.fullHeight}>
                  <h1>403 - Unauthorized</h1>
                </Center>
              )}
            </Suspense>
          ) : (
            <PageLoader />
          )}
        </div>
        <Footer />
        <ScrollToTop />
      </AppShell.Main>
    </AppShell>
  )
}

export default AuthenticatedArea
