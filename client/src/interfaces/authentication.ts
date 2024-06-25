export enum Permission {
  CHAIR_MEMBER = 'chair-member',
}

export interface User {
  firstName: string
  lastName: string
  email: string
  username: string
  mgmtAccess: boolean
}
