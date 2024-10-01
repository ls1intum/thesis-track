import { ILightUser } from '../../requests/responses/user'
import { Group, MantineSize, Text } from '@mantine/core'
import { formatUser } from '../../utils/format'
import CustomAvatar from '../CustomAvatar/CustomAvatar'

interface IAvatarUserProps {
  user: ILightUser
  withUniversityId?: boolean
  size?: MantineSize
}

const AvatarUser = (props: IAvatarUserProps) => {
  const { user, withUniversityId = false, size = 'sm' } = props

  return (
    <Group gap={5} preventGrowOverflow wrap='nowrap' style={{ overflow: 'hidden' }}>
      <CustomAvatar user={user} size={size} />
      <Text size={size} truncate style={{ flex: 1, minWidth: 0 }}>
        {formatUser(user, { withUniversityId })}
      </Text>
    </Group>
  )
}

export default AvatarUser
