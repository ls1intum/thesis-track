import { IThesis } from '../../requests/responses/thesis'
import { Button, Modal, Stack } from '@mantine/core'
import { Link } from 'react-router-dom'
import ThesisData from '../ThesisData/ThesisData'

interface IThesisPreviewModalProps {
  thesis: IThesis | undefined
  opened: boolean
  onClose: () => unknown
}

const ThesisPreviewModal = (props: IThesisPreviewModalProps) => {
  const { thesis, opened, onClose } = props

  return (
    <Modal title={thesis?.title} opened={opened} onClose={onClose} size='xl'>
      {thesis && (
        <Stack gap='md'>
          <ThesisData
            thesis={thesis}
            additionalInformation={['info', 'abstract', 'state', 'keywords', 'advisor-comments']}
          />
          <Button component={Link} to={`/theses/${thesis.thesisId}`} variant='outline' fullWidth>
            View All Details
          </Button>
        </Stack>
      )}
    </Modal>
  )
}

export default ThesisPreviewModal
