import { ApplicationState, IApplication } from '../../../../requests/responses/application'
import { Button, Checkbox, Modal, Textarea } from '@mantine/core'
import { useForm } from '@mantine/form'
import UserMultiSelect from '../../../../components/UserMultiSelect/UserMultiSelect'
import AuthenticatedIframe from '../../../../components/AuthenticatedIframe/AuthenticatedIframe'
import { ApiResponse, doRequest } from '../../../../requests/request'
import { notifications } from '@mantine/notifications'
import { useState } from 'react'

interface ILegacyApplicationReviewModalProps {
  application: IApplication | undefined;
  onClose: () => unknown;
  onUpdate: (application: IApplication) => unknown;
}

const LegacyApplicationReviewModal = (props: ILegacyApplicationReviewModalProps) => {
  const {application, onClose, onUpdate} = props;

  const form = useForm<{
    comment: string,
    advisors: string[],
    notifyUser: boolean
  }>({
    mode: 'controlled',
    initialValues: {
      comment: '',
      advisors: [],
      notifyUser: true
    },
    validateInputOnBlur: true,
    validate: {
      advisors: value => {
        if (value.length === 0) {
          return 'Advisor is required';
        }
      }
    }
  })

  const [loading, setLoading] = useState(false)

  return (
    <Modal
      centered
      size='90%'
      opened={!!application}
      onClose={onClose}
    >
      <form>
        {application && (
          <>
            {application.user.hasCv && (
              <AuthenticatedIframe url={`/v1/users/${application.user.userId}/cv`} />
            )}
            {application.user.hasExaminationReport && (
              <AuthenticatedIframe url={`/v1/users/${application.user.userId}/examination-report`} />
            )}
            {application.user.hasDegreeReport && (
              <AuthenticatedIframe url={`/v1/users/${application.user.userId}/degree-report`} />
            )}
          </>
        )}

        {application?.state === ApplicationState.NOT_ASSESSED && (
          <>
            <UserMultiSelect
              label="Advisor"
              groups={['advisor']}
              multiSelect={false}
              {...form.getInputProps('advisors')}
            />
            <Textarea
              autosize
              minRows={5}
              label='Comment'
              placeholder='Comment'
              {...form.getInputProps('comment')}
            />

            <Checkbox
              mt='md'
              label='Notify Student'
              {...form.getInputProps('notifyUser')}
            />

            <Button variant="default" loading={loading} onClick={async () => {
              setLoading(true)

              const response = await doRequest<IApplication>(
                `/v2/applications/${application.applicationId}/reject`,
                {
                  method: 'PUT',
                  requiresAuth: true,
                  data: {
                    comment: form.values.comment,
                    notifyUser: form.values.notifyUser,
                  },
                },
              ).catch<ApiResponse<IApplication>>(() => ({ok: false, data: undefined, status: 500}))

              setLoading(false)

              if (response.ok) {
                notifications.show({
                  color: 'green',
                  autoClose: 5000,
                  title: 'Success',
                  message: 'Application rejected successfully',
                })

                onUpdate(response.data)
                onClose()
              } else {
                notifications.show({
                  color: 'red',
                  autoClose: 5000,
                  title: 'Error',
                  message: 'Failed to reject application',
                })
              }
            }}>
              Reject
            </Button>
            <Button variant="default" loading={loading} disabled={!form.isValid()} onClick={async () => {
              setLoading(true)

              const response = await doRequest<IApplication>(
                `/v1/applications/${application.applicationId}/accept`,
                {
                  method: 'PUT',
                  requiresAuth: true,
                  data: {
                    notifyUser: form.values.notifyUser,
                    comment: form.values.comment,
                    advisorId: form.values.advisors?.[0]
                  },
                },
              ).catch<ApiResponse<IApplication>>(() => ({ok: false, data: undefined, status: 500}))

              setLoading(false)

              if (response.ok) {
                notifications.show({
                  color: 'green',
                  autoClose: 5000,
                  title: 'Success',
                  message: 'Application accepted successfully',
                })

                onUpdate(response.data)
                onClose()
              } else {
                notifications.show({
                  color: 'red',
                  autoClose: 5000,
                  title: 'Error',
                  message: 'Failed to accept application',
                })
              }
            }}>
              Accept
            </Button>
          </>
        )}
      </form>
    </Modal>
  )
}

export default LegacyApplicationReviewModal;