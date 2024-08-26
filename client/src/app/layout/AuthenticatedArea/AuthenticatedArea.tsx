import React, { PropsWithChildren, Suspense, useEffect } from 'react'
import {
  ActionIcon,
  AppShell,
  Burger,
  Center,
  Divider,
  Group,
  Stack,
  Text,
  useMantineColorScheme,
} from '@mantine/core'
import * as classes from './AuthenticatedArea.module.css'
import { Link, useLocation } from 'react-router-dom'
import { useDisclosure } from '@mantine/hooks'
import {
  Kanban,
  Moon,
  NewspaperClipping,
  Scroll,
  SignOut,
  Sun,
  FolderSimplePlus,
  User,
  PaperPlaneTilt,
} from 'phosphor-react'
import { useIsSmallerBreakpoint } from '../../../hooks/theme'
import { useAuthenticationContext } from '../../../hooks/authentication'
import Logo from '../../../static/logo'
import { useNavigationType } from 'react-router'
import ScrollToTop from '../ScrollToTop/ScrollToTop'
import PageLoader from '../../../components/PageLoader/PageLoader'

export interface IAuthenticatedAreaProps {
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
    label: 'Theses Overview',
    icon: Kanban,
    groups: ['admin', 'advisor', 'supervisor'],
  },
]

const AuthenticatedArea = (props: PropsWithChildren<IAuthenticatedAreaProps>) => {
  const {
    children,
    requireAuthentication = true,
    collapseNavigation = false,
    requiredGroups,
  } = props

  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const [opened, { toggle, close }] = useDisclosure()

  const location = useLocation()
  const navigationType = useNavigationType()

  const showHeader = useIsSmallerBreakpoint('md') || collapseNavigation
  const auth = useAuthenticationContext()

  useEffect(() => {
    if (requireAuthentication && !auth.isAuthenticated) {
      auth.login()
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
      <Stack px='md'>
        {children}
        <ScrollToTop />
      </Stack>
    )
  }

  return (
    <AppShell
      header={{ collapsed: !showHeader, height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'md',
        collapsed: { mobile: !opened, desktop: !opened && collapseNavigation },
      }}
      padding={0}
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
        <AppShell.Section grow mb='md'>
          <Group preventGrowOverflow={false}>
            <Logo className={classes.logo} />
            <Text className={classes.siteName} fw='bold'>
              ThesisTrack
            </Text>
            <ActionIcon
              variant='outline'
              color={colorScheme === 'dark' ? 'yellow' : 'pale-purple'}
              onClick={() => toggleColorScheme()}
              title='Toggle color scheme'
              ml='auto'
            >
              {colorScheme === 'dark' ? <Sun size='1.1rem' /> : <Moon size='1.1rem' />}
            </ActionIcon>
          </Group>
          <Divider my='sm' />
          {links
            .filter(
              (item) =>
                !item.groups || item.groups.some((role) => auth.user?.groups.includes(role)),
            )
            .map((item) => (
              <Link
                className={classes.link}
                data-active={location.pathname.startsWith(item.link) || undefined}
                key={item.label}
                to={item.link}
              >
                <item.icon className={classes.linkIcon} size={32} />
                <span>{item.label}</span>
              </Link>
            ))}
        </AppShell.Section>
        <AppShell.Section>
          <Link
            to='/settings/my-information'
            className={classes.link}
            data-active={location.pathname.startsWith('/settings/my-information') || undefined}
          >
            <User className={classes.linkIcon} size={32} />
            <span>My Information</span>
          </Link>
          <Link to='/logout' className={classes.link}>
            <SignOut className={classes.linkIcon} size={32} />
            <span>Logout</span>
          </Link>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        {auth.user ? (
          <Suspense fallback={<PageLoader />}>
            {!requiredGroups || requiredGroups.some((role) => auth.user?.groups.includes(role)) ? (
              children
            ) : (
              <Center className={classes.fullHeight}>
                <h1>403 - Unauthorized</h1>
              </Center>
            )}
          </Suspense>
        ) : (
          <PageLoader />
        )}
        <ScrollToTop />
      </AppShell.Main>
    </AppShell>
  )
}

export default AuthenticatedArea
