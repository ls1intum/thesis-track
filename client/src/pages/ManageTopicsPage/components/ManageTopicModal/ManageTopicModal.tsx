import { Modal } from '@mantine/core'
import { ITopic } from '../../../../requests/responses/topic'

interface ICreateTopicModalProps {
  opened: boolean
  onClose: () => unknown
  topic?: ITopic
}

const ManageTopicModal = (props: ICreateTopicModalProps) => {
  const { opened, onClose } = props

  return <Modal opened={opened} onClose={onClose}></Modal>
}

export default ManageTopicModal
