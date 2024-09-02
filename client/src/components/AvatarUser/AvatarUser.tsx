import { ILightUser } from '../../requests/responses/user'
import { Avatar, Group, MantineSize, Text } from '@mantine/core'
import { formatUser } from '../../utils/format'

interface IAvatarUserProps {
  user: ILightUser
  withUniversityId?: boolean
  size?: MantineSize
}

const AvatarUser = (props: IAvatarUserProps) => {
  const { user, withUniversityId = true, size = 'sm' } = props

  return (
    <Group gap={5} preventGrowOverflow wrap='nowrap' style={{ overflow: 'hidden' }}>
      <Avatar
        src={user.avatar || undefined}
        name={`${user.firstName} ${user.lastName}`}
        color='initials'
        size={size}
      />
      <Text size={size} truncate style={{ flex: 1, minWidth: 0 }}>
        {formatUser(user, { withUniversityId })}
      </Text>
    </Group>
  )
}

export default AvatarUser
