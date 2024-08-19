import { ThesisStateColor } from '../../config/colors'
import { formatThesisState } from '../../utils/format'
import { Badge } from '@mantine/core'
import React from 'react'
import { ThesisState } from '../../requests/responses/thesis'

interface IThesisStateBadgeProps {
  state: ThesisState
}

const ThesisStateBadge = (props: IThesisStateBadgeProps) => {
  const { state } = props

  return <Badge color={ThesisStateColor[state] ?? 'gray'}>{formatThesisState(state)}</Badge>
}

export default ThesisStateBadge
