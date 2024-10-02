import { ILightUser } from '../../requests/responses/user'
import { Avatar, MantineSize } from '@mantine/core'
import { getAvatar } from '../../utils/user'
import { BoxProps } from '@mantine/core/lib/core'

interface ICustomAvatarProps extends BoxProps {
  user: ILightUser
  size?: MantineSize | number
}

const CustomAvatar = (props: ICustomAvatarProps) => {
  const { user, size, ...other } = props

  return (
    <Avatar
      src={getAvatar(user)}
      name={`${user.firstName} ${user.lastName}`}
      color='initials'
      size={size}
      {...other}
    />
  )
}

export default CustomAvatar
