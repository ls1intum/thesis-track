import { ILightUser } from '../../requests/responses/user'
import { MantineSize, Stack } from '@mantine/core'
import AvatarUser from '../AvatarUser/AvatarUser'

interface IAvatarUserListProps {
  users: ILightUser[]
  withUniversityId?: boolean
  size?: MantineSize
  oneLine?: boolean
}

const AvatarUserList = (props: IAvatarUserListProps) => {
  const { users, withUniversityId, size, oneLine = false } = props

  if (oneLine && users.length > 0) {
    return <AvatarUser user={users[0]} withUniversityId={withUniversityId} size={size} />
  }

  return (
    <Stack gap='xs'>
      {users.map((user) => (
        <AvatarUser key={user.userId} user={user} withUniversityId={withUniversityId} size={size} />
      ))}
    </Stack>
  )
}

export default AvatarUserList
