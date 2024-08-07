import {
  ActionIcon,
  Card,
  Group,
  InputLabel,
  rem,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core'
import { ImageSquare, UploadSimple, X } from 'phosphor-react'
import { Dropzone, PDF_MIME_TYPE } from '@mantine/dropzone'
import { showSimpleError } from '../../utils/notification'

interface IUploadAreaProps {
  value: File | undefined
  onChange: (file: File | undefined) => unknown
  label?: string
  required?: boolean
  maxSize?: number
}

const UploadArea = (props: IUploadAreaProps) => {
  const { label, required, value, onChange, maxSize = 1024 } = props

  const theme = useMantineTheme()

  return (
    <Stack gap='0'>
      {label && (
        <Group align='left'>
          <InputLabel required={required}>{label}</InputLabel>
        </Group>
      )}
      {value ? (
        <Card shadow='sm' withBorder>
          <Group align='apart'>
            <Text c='dimmed' fz='sm'>
              {value.name}
            </Text>
            <ActionIcon onClick={() => onChange(undefined)}>
              <X />
            </ActionIcon>
          </Group>
        </Card>
      ) : (
        <Dropzone
          name={label}
          onDrop={(files) => onChange(files[0])}
          onReject={() => {
            showSimpleError(`Failed upload file. Max file size is ${Math.floor(maxSize / 1024)}MB`)
          }}
          maxSize={maxSize * 1024}
          accept={PDF_MIME_TYPE}
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
                The file should not exceed {Math.floor(maxSize / 1024)}MB
              </Text>
            </Stack>
          </Group>
        </Dropzone>
      )}
    </Stack>
  )
}

export default UploadArea
