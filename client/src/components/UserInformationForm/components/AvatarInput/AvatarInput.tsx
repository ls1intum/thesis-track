import { getAvatar } from '../../../../utils/user'
import AvatarEditor from 'react-avatar-editor'
import { useLoggedInUser } from '../../../../hooks/authentication'
import { Avatar, Button, Center, Group, Input, Modal, Slider, Stack, Text } from '@mantine/core'
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone'
import { useMemo, useRef, useState } from 'react'

interface IAvatarInputProps {
  value: File | undefined
  onChange: (file: File | undefined) => unknown
  label?: string
  required?: boolean
}

const AvatarInput = (props: IAvatarInputProps) => {
  const { value, onChange, label, required } = props

  const editorRef = useRef<AvatarEditor | null>(null)
  const user = useLoggedInUser()

  const avatarUrl = useMemo(() => {
    return value ? URL.createObjectURL(value) : getAvatar(user)
  }, [user, value])

  const [file, setFile] = useState<File>()
  const [scale, setScale] = useState(1)

  const onSave = async () => {
    const canvas = editorRef.current?.getImage().toDataURL()

    if (!canvas) {
      return
    }

    const data = await fetch(canvas).then((res) => res.blob())

    onChange(new File([data], 'avatar.png'))
    setFile(undefined)
    setScale(1)
  }

  return (
    <Input.Wrapper label={label} required={required}>
      <Dropzone
        onDrop={(files) => {
          setFile(files[0])
        }}
        maxSize={2 * 1024 * 1024}
        accept={IMAGE_MIME_TYPE}
      >
        <Group>
          <Avatar
            src={avatarUrl}
            name={`${user.firstName} ${user.lastName}`}
            color='initials'
            size='xl'
          />
          <Stack>
            <Text size='xl' inline>
              Drag the file here or click to select file
            </Text>
            <Text size='sm' c='dimmed' inline>
              The file should not exceed 2MB
            </Text>
          </Stack>
        </Group>
      </Dropzone>
      <Modal opened={!!file} onClose={() => setFile(undefined)}>
        {file && (
          <Stack>
            <Center>
              <AvatarEditor
                ref={editorRef}
                image={file}
                width={300}
                height={300}
                border={20}
                scale={scale}
                color={[255, 255, 255, 0.6]}
                rotate={0}
              />
            </Center>
            <Slider value={scale} onChange={(x) => setScale(x)} min={1} max={3} step={0.1} />
            <Button onClick={onSave} fullWidth>
              Save Avatar
            </Button>
          </Stack>
        )}
      </Modal>
    </Input.Wrapper>
  )
}

export default AvatarInput
