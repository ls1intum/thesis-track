import { AspectRatio, Group, Text } from '@mantine/core'
import { useMemo } from 'react'
import { UploadFileType } from '../../config/types'
import { File } from 'phosphor-react'
import { getAdjustedFileType } from '../../utils/file'

interface IFilePreviewProps {
  file: File
  type: UploadFileType
  aspectRatio?: number
}

const FilePreview = (props: IFilePreviewProps) => {
  const { file, type, aspectRatio = 16 / 9 } = props

  const adjustedType = getAdjustedFileType(file.name, type)

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
