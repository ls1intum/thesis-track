import { ILightUser } from '../../requests/responses/user'
import { Avatar, Group, MantineSize, Text } from '@mantine/core'
import { formatUser } from '../../utils/format'
import { getSmallerMantineSize } from '../../utils/theme'

interface IAvatarUserProps {
  user: ILightUser
  withUniversityId?: boolean
  size?: MantineSize
}

const AvatarUser = (props: IAvatarUserProps) => {
  const { user, withUniversityId = true, size = 'md' } = props

  return (
    <Group gap='xs' preventGrowOverflow wrap='nowrap' style={{ overflow: 'hidden' }}>
      <Avatar
        src={user.avatar || undefined}
        name={`${user.firstName} ${user.lastName}`}
        color='initials'
        size={getSmallerMantineSize(size)}
      />
      <Text size={size} truncate style={{ flex: 1, minWidth: 0 }}>
        {formatUser(user, { withUniversityId })}
      </Text>
    </Group>
  )
}

export default AvatarUser
