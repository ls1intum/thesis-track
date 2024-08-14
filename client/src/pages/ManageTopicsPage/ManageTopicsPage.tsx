import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import React, { useState } from 'react'
import { usePageTitle } from '../../hooks/theme'
import { Button, Group, Stack, Title, Center } from '@mantine/core'
import TopicsProvider from '../../contexts/TopicsProvider/TopicsProvider'
import TopicsTable from '../../components/TopicsTable/TopicsTable'
import { ITopic } from '../../requests/responses/topic'
import { Pencil } from 'phosphor-react'
import CloseTopicButton from './components/CloseTopicButton/CloseTopicButton'
import ReplaceTopicModal from './components/ReplaceTopicModal/ReplaceTopicModal'

const ManageTopicsPage = () => {
  usePageTitle('Manage Topics')

  const [editingTopic, setEditingTopic] = useState<ITopic>()
  const [createTopicModal, setCreateTopicModal] = useState(false)

  return (
    <ContentContainer>
      <TopicsProvider>
        <Stack gap='md'>
          <Group>
            <Title>Manage Topics</Title>
            <Button ml='auto' onClick={() => setCreateTopicModal(true)} visibleFrom='md'>
              Create Topic
            </Button>
          </Group>
          <ReplaceTopicModal opened={createTopicModal} onClose={() => setCreateTopicModal(false)} />
          <ReplaceTopicModal
            opened={!!editingTopic}
            onClose={() => setEditingTopic(undefined)}
            topic={editingTopic}
          />
          <Button ml='auto' onClick={() => setCreateTopicModal(true)} hiddenFrom='md'>
            Create Topic
          </Button>
          <TopicsTable
            columns={['title', 'supervisor', 'advisor', 'createdAt', 'actions']}
            actions={(topic) => (
              <Center onClick={(e) => e.stopPropagation()}>
                <Group>
                  {!topic.closedAt && (
                    <Button size='xs' onClick={() => setEditingTopic(topic)}>
                      <Pencil />
                    </Button>
                  )}
                  <CloseTopicButton size='xs' topic={topic} />
                </Group>
              </Center>
            )}
          />
        </Stack>
      </TopicsProvider>
    </ContentContainer>
  )
}

export default ManageTopicsPage
