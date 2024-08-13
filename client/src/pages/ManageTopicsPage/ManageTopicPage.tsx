import ContentContainer from '../../app/layout/ContentContainer/ContentContainer'
import React, { useState } from 'react'
import { usePageTitle } from '../../hooks/theme'
import { Button, Group, Title } from '@mantine/core'
import TopicsProvider from '../../contexts/TopicsProvider/TopicsProvider'
import TopicsTable from '../../components/TopicsTable/TopicsTable'
import { ITopic } from '../../requests/responses/topic'
import ManageTopicModal from './components/ManageTopicModal/ManageTopicModal'
import { Pencil, Trash } from 'phosphor-react'
import CloseTopicButton from './components/CloseTopicButton/CloseTopicButton'

const ManageTopicPage = () => {
  usePageTitle('Manage Topics')

  const [editingTopic, setEditingTopic] = useState<ITopic>()
  const [createTopicModal, setCreateTopicModal] = useState(false)

  return (
    <ContentContainer>
      <Title>Manage Topics</Title>
      <TopicsProvider>
        <ManageTopicModal opened={createTopicModal} onClose={() => setCreateTopicModal(false)} />
        <ManageTopicModal
          opened={!!editingTopic}
          onClose={() => setEditingTopic(undefined)}
          topic={editingTopic}
        />
        <Button ml='auto' onClick={() => setCreateTopicModal(true)}>
          Create Topic
        </Button>
        <TopicsTable
          actions={(topic) => (
            <Group>
              <Button onClick={() => setEditingTopic(topic)}>
                <Pencil />
              </Button>
              <CloseTopicButton topic={topic} />
            </Group>
          )}
        />
      </TopicsProvider>
    </ContentContainer>
  )
}

export default ManageTopicPage
