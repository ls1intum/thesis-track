import { useDocumentTitle, useMediaQuery } from '@mantine/hooks'
import { useMantineTheme } from '@mantine/core'
import { GLOBAL_CONFIG } from '../config/global'

export function useIsSmallerBreakpoint(breakpoint: string) {
  const theme = useMantineTheme()

  return useMediaQuery(`(max-width: ${theme.breakpoints[breakpoint]})`) || false
}

export function useIsBiggerThanBreakpoint(breakpoint: string) {
  const theme = useMantineTheme()

  return useMediaQuery(`(min-width: ${theme.breakpoints[breakpoint]})`)
}

export function usePageTitle(title: string) {
  useDocumentTitle(`${title} - ${GLOBAL_CONFIG.title}`)
}
