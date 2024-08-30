import { MantineSize } from '@mantine/core'

export function getSmallerMantineSize(size: MantineSize) {
  const sizes = ['xs', 'sm', 'md', 'lg', 'xl']
  const currentIndex = sizes.indexOf(size)

  return currentIndex > 0 ? sizes[currentIndex - 1] : sizes[0]
}
