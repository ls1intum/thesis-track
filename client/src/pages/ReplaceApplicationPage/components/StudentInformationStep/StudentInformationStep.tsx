import UserInformationForm from '../../../../components/UserInformationForm/UserInformationForm'

interface IStudentInformationStepProps {
  onComplete: () => unknown
}

const StudentInformationStep = (props: IStudentInformationStepProps) => {
  const { onComplete } = props

  return <UserInformationForm requireCompletion={true} onComplete={onComplete} />
}

export default StudentInformationStep
