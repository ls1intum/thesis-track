import { ILightUser } from '../../../../requests/responses/user'
import { UploadFileType } from '../../../../config/types'
import { Button, Center, Group, Input, Table, Text } from '@mantine/core'
import { formatDate } from '../../../../utils/format'
import AuthenticatedFilePreviewButton from '../../../../components/AuthenticatedFilePreviewButton/AuthenticatedFilePreviewButton'
import { DownloadSimple, Eye, Trash } from 'phosphor-react'
import AuthenticatedFileDownloadButton from '../../../../components/AuthenticatedFileDownloadButton/AuthenticatedFileDownloadButton'
import AvatarUser from '../../../../components/AvatarUser/AvatarUser'
import { useState } from 'react'

interface IFileHistoryTableProps {
  data: Array<{
    name: string
    type: UploadFileType
    url: string
    filename: string
    uploadedAt: string
    uploadedBy: ILightUser
    onDelete?: () => PromiseLike<unknown>
  }>
}

const FileHistoryTable = (props: IFileHistoryTableProps) => {
  const { data } = props

  const [loading, setLoading] = useState(false)

  if (data.length === 0) {
    return null
  }

  const onDelete = async (row: IFileHistoryTableProps['data'][number]) => {
    setLoading(true)

    try {
      await row.onDelete?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Input.Wrapper label='File Upload History'>
      <Table.ScrollContainer minWidth={800}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>File</Table.Th>
              <Table.Th>Uploaded By</Table.Th>
              <Table.Th>Uploaded At</Table.Th>
              <Table.Th ta='center'>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((row) => (
              <Table.Tr key={row.url}>
                <Table.Td>
                  <Text>{row.name}</Text>
                </Table.Td>
                <Table.Td width={200}>
                  <AvatarUser user={row.uploadedBy} />
                </Table.Td>
                <Table.Td width={170}>
                  <Text>{formatDate(row.uploadedAt)}</Text>
                </Table.Td>
                <Table.Td width={220}>
                  <Center>
                    <Group gap='xs'>
                      <AuthenticatedFilePreviewButton
                        url={row.url}
                        filename={row.filename}
                        type={row.type}
                        size='xs'
                      >
                        <Eye />
                      </AuthenticatedFilePreviewButton>
                      <AuthenticatedFileDownloadButton
                        url={row.url}
                        filename={row.filename}
                        size='xs'
                      >
                        <DownloadSimple />
                      </AuthenticatedFileDownloadButton>
                      {row.onDelete && (
                        <Button loading={loading} size='xs' onClick={() => onDelete(row)}>
                          <Trash />
                        </Button>
                      )}
                    </Group>
                  </Center>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Input.Wrapper>
  )
}

export default FileHistoryTable
