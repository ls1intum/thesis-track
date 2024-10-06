import React, { useState } from 'react'
import { usePageTitle } from '../../hooks/theme'
import { Button, Group, Stack, Title } from '@mantine/core'
import TopicsProvider from '../../contexts/TopicsProvider/TopicsProvider'
import TopicsTable from '../../components/TopicsTable/TopicsTable'
import { ITopic } from '../../requests/responses/topic'
import { Pencil } from 'phosphor-react'
import CloseTopicButton from './components/CloseTopicButton/CloseTopicButton'
import ReplaceTopicModal from './components/ReplaceTopicModal/ReplaceTopicModal'
import TopicsFilters from '../../components/TopicsFilters/TopicsFilters'

const ManageTopicsPage = () => {
  usePageTitle('Manage Topics')

  const [editingTopic, setEditingTopic] = useState<ITopic>()
  const [createTopicModal, setCreateTopicModal] = useState(false)

  return (
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
        <TopicsFilters visible={['closed']} />
        <TopicsTable
          columns={['state', 'title', 'types', 'supervisor', 'advisor', 'createdAt', 'actions']}
          extraColumns={{
            actions: {
              accessor: 'actions',
              title: 'Actions',
              textAlign: 'center',
              noWrap: true,
              width: 120,
              render: (topic) => (
                <Group
                  preventGrowOverflow={false}
                  justify='center'
                  onClick={(e) => e.stopPropagation()}
                >
                  {!topic.closedAt && (
                    <Button size='xs' onClick={() => setEditingTopic(topic)}>
                      <Pencil />
                    </Button>
                  )}
                  <CloseTopicButton size='xs' topic={topic} />
                </Group>
              ),
            },
          }}
        />
      </Stack>
    </TopicsProvider>
  )
}

export default ManageTopicsPage
