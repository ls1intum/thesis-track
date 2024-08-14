import { ITopic } from '../../../../requests/responses/topic'

interface IMotivationStepProps {
  topic: ITopic | undefined
  onComplete: () => unknown
}

const MotivationStep = (props: IMotivationStepProps) => {
  const {} = props

  return <></>
}

export default MotivationStep
