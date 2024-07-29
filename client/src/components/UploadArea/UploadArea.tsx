import { ActionIcon, Card, Group, rem, Text, useMantineTheme } from '@mantine/core'
import { ImageSquare, UploadSimple, X } from 'phosphor-react'
import { Dropzone, PDF_MIME_TYPE } from '@mantine/dropzone'
import { notifications } from '@mantine/notifications'

interface IUploadAreaProps {
  label: string;
  required: boolean;
  value: File | undefined;
  onChange: (file: File | undefined) => unknown;
  maxSize?: number;
  accept?: string[]
}

const UploadArea = (props: IUploadAreaProps) => {
  const {label, required, value, onChange, maxSize = 3 * 1024, accept = PDF_MIME_TYPE} = props;

  const theme = useMantineTheme();

  if (value) {
    return (
      <>
        <Group align='left'>
          <Text fw={500} fz='sm'>
            {label}
          </Text>
          {required && (<Text color='red'>*</Text>)}
        </Group>
        <Card shadow='sm' withBorder>
          <Group align='apart'>
            <Text c='dimmed' fz='sm'>
              {value.name}
            </Text>
            <ActionIcon
              onClick={() => onChange(undefined)}
            >
              <X />
            </ActionIcon>
          </Group>
        </Card>
      </>
    )
  }

  return (
    <>
      <Group align='left'>
        <Text fw={500} fz='sm'>
          {label}
        </Text>
        {required && (<Text color='red'>*</Text>)}
      </Group>
      <Dropzone
        name={label}
        onDrop={(files) => onChange(files[0])}
        onReject={() => {
          notifications.show({
            color: 'red',
            autoClose: 5000,
            title: 'Error',
            message: `Failed upload file.`,
          })
        }}
        maxSize={maxSize}
        accept={accept}
      >
        <Group
          align='center'
          gap='xl'
          style={{ minHeight: rem(220), pointerEvents: 'none' }}
        >
          <Dropzone.Accept>
            <UploadSimple size='3.2rem' color={theme.colors[theme.primaryColor][4]} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <X size='3.2rem' color={theme.colors.red[4]} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <ImageSquare size='3.2rem' />
          </Dropzone.Idle>

          <div>
            <Text size='xl' inline>
              Drag the file here or click to select file
            </Text>
            <Text size='sm' color='dimmed' inline mt={7}>
              The file should not exceed {Math.floor(maxSize / 1024)}mb
            </Text>
          </div>
        </Group>
      </Dropzone>
    </>
  )
}

export default UploadArea;