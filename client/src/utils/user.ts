import { GLOBAL_CONFIG } from '../config/global'
import { ILightUser } from '../requests/responses/user'

export function getAvatar(user: ILightUser) {
  return user.avatar && !user.avatar.startsWith('http')
    ? `${GLOBAL_CONFIG.server_host}/api/v2/avatars/${user.userId}?filename=${user.avatar}`
    : user.avatar || undefined
}
