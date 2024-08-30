import { ILightUser } from '../../requests/responses/user'
import { Group, MantineSize } from '@mantine/core'
import AvatarUser from '../AvatarUser/AvatarUser'

interface IAvatarUserListProps {
  users: ILightUser[]
  withUniversityId?: boolean
  size?: MantineSize
}

const AvatarUserList = (props: IAvatarUserListProps) => {
  const { users, withUniversityId, size } = props

  return (
    <Group gap='xs'>
      {users.map((user) => (
        <AvatarUser key={user.userId} user={user} withUniversityId={withUniversityId} size={size} />
      ))}
    </Group>
  )
}

export default AvatarUserList
