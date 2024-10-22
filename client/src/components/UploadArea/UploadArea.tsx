import {
  ActionIcon,
  Card,
  Center,
  Group,
  Input,
  rem,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core'
import { ImageSquare, UploadSimple, X } from 'phosphor-react'
import { Dropzone, IMAGE_MIME_TYPE, PDF_MIME_TYPE } from '@mantine/dropzone'
import { showSimpleError } from '../../utils/notification'
import { UploadFileType } from '../../config/types'
import FilePreview from '../FilePreview/FilePreview'

interface IUploadAreaProps {
  value: File | undefined
  onChange: (file: File | undefined) => unknown
  maxSize: number
  accept: UploadFileType
  label?: string
  required?: boolean
}

const UploadArea = (props: IUploadAreaProps) => {
  const { label, required, value, onChange, maxSize, accept } = props

  const theme = useMantineTheme()

  const getMimeTypes = () => {
    if (accept === 'image') {
      return IMAGE_MIME_TYPE
    }

    if (accept === 'pdf') {
      return PDF_MIME_TYPE
    }

    return undefined
  }

  const mimeTypes = getMimeTypes()

  return (
    <Input.Wrapper label={label} required={required}>
      {value ? (
        <Card shadow='sm' withBorder>
          <Center>
            <Stack>
              <FilePreview file={value} type={accept} />
              <ActionIcon
                mx='auto'
                onClick={() => {
                  onChange(undefined)
                }}
              >
                <X />
              </ActionIcon>
            </Stack>
          </Center>
        </Card>
      ) : (
        <Dropzone
          name={label}
          onDrop={(files) => {
            onChange(files[0])
          }}
          onReject={() => {
            showSimpleError(
              `Failed upload file. Max file size is ${Math.floor(maxSize / 1024 / 1024)}MB`,
            )
          }}
          maxSize={maxSize}
          accept={mimeTypes}
        >
          <Group align='center' gap='xl' style={{ minHeight: rem(150), pointerEvents: 'none' }}>
            <Dropzone.Accept>
              <UploadSimple size='3.2rem' color={theme.colors[theme.primaryColor][4]} />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <X size='3.2rem' color={theme.colors.red[4]} />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <ImageSquare size='3.2rem' />
            </Dropzone.Idle>
            <Stack>
              <Text size='xl' inline>
                Drag the file here or click to select file
              </Text>
              <Text size='sm' c='dimmed' inline>
                The file should not exceed {Math.floor(maxSize / 1024 / 1024)}MB
              </Text>
            </Stack>
          </Group>
        </Dropzone>
      )}
    </Input.Wrapper>
  )
}

export default UploadArea
