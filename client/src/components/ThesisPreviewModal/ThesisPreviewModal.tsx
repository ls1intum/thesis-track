import { IThesis } from '../../requests/responses/thesis'
import { Button, Grid, Modal, Stack } from '@mantine/core'
import LabeledItem from '../LabeledItem/LabeledItem'
import DocumentEditor from '../DocumentEditor/DocumentEditor'
import { formatDate, formatUser } from '../../utils/format'
import { Link } from 'react-router-dom'
import ThesisStateBadge from '../ThesisStateBadge/ThesisStateBadge'

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
          <Grid>
            <Grid.Col span={{ md: 4 }}>
              <LabeledItem
                label='Supervisor'
                value={thesis.supervisors.map((supervisor) => formatUser(supervisor)).join(', ')}
              />
            </Grid.Col>
            <Grid.Col span={{ md: 4 }}>
              <LabeledItem
                label='Advisor'
                value={thesis.advisors.map((advisor) => formatUser(advisor)).join(', ')}
              />
            </Grid.Col>
            <Grid.Col span={{ md: 4 }}>
              <LabeledItem
                label='Student'
                value={thesis.students.map((student) => formatUser(student)).join(', ')}
              />
            </Grid.Col>
            {thesis.startDate && (
              <Grid.Col span={{ md: 4 }}>
                <LabeledItem
                  label='Start Date'
                  value={formatDate(thesis.startDate, { withTime: false })}
                />
              </Grid.Col>
            )}
            {thesis.endDate && (
              <Grid.Col span={{ md: 4 }}>
                <LabeledItem
                  label='End Date'
                  value={formatDate(thesis.endDate, { withTime: false })}
                />
              </Grid.Col>
            )}
            <Grid.Col span={{ md: 4 }}>
              <LabeledItem label='State' value={<ThesisStateBadge state={thesis.state} />} />
            </Grid.Col>
          </Grid>
          <DocumentEditor label='Abstract' value={thesis.abstractText} />
          <DocumentEditor label='Info' value={thesis.infoText} />
          <Button component={Link} to={`/theses/${thesis.thesisId}`} variant='outline' fullWidth>
            View All Details
          </Button>
        </Stack>
      )}
    </Modal>
  )
}

export default ThesisPreviewModal
