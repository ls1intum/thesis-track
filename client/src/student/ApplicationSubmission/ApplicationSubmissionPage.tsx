import { ThesisApplication } from '../../interface/thesisApplication'
import { ApplicationFormAccessMode } from '../form/ThesisApplicationForm'

export interface ApplicationFormProps {
  application?: ThesisApplication
  accessMode: ApplicationFormAccessMode
  onSuccess: () => void
}

interface ApplicationSubmissionPageProps {
  child: React.ReactElement<ApplicationFormProps>
}

export const ApplicationSubmissionPage = ({
  child,
}: ApplicationSubmissionPageProps): JSX.Element => {
  return (
    <>
      <div style={{ margin: '5vh 5vw' }}>{child}</div>
    </>
  )
}
