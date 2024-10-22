import { AspectRatio, Group, Text } from '@mantine/core'
import { useMemo } from 'react'
import { UploadFileType } from '../../config/types'
import { File } from 'phosphor-react'

interface IFilePreviewProps {
  file: File
  type: UploadFileType
  aspectRatio?: number
}

const FilePreview = (props: IFilePreviewProps) => {
  const { file, type, aspectRatio = 16 / 9 } = props

  let adjustedType = type

  if (file.name.endsWith('.pdf')) {
    adjustedType = 'pdf'
  }

  if (file.name.endsWith('.png') || file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) {
    adjustedType = 'image'
  }

  const url = useMemo(() => {
    if (adjustedType === 'pdf') {
      return `${URL.createObjectURL(file)}#toolbar=0&navpanes=0`
    }

    return URL.createObjectURL(file)
  }, [file, adjustedType])

  return (
    <AspectRatio ratio={aspectRatio}>
      {adjustedType === 'pdf' && <iframe style={{ border: 0 }} src={url} />}
      {adjustedType === 'image' && <img alt={file.name} src={url} />}
      {adjustedType === 'any' && (
        <Group>
          <File />
          <Text>{file.name}</Text>
        </Group>
      )}
    </AspectRatio>
  )
}

export default FilePreview
