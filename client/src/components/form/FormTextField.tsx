import { Stack, Text, TextInput, TextInputProps, Textarea, TextareaProps } from '@mantine/core'

interface FormTextFieldProps {
  label: string
  placeholder: string
  value: string
  required?: boolean
  disabled?: boolean
  numeric?: boolean
  textArea?: boolean
  readOnly?: boolean
  textInputProps?: TextInputProps
  textAreaProps?: TextareaProps
}

const FormTextField = ({
  label,
  placeholder,
  value,
  textInputProps,
  textAreaProps,
  required = false,
  disabled = false,
  numeric = false,
  textArea = false,
  readOnly = false,
}: FormTextFieldProps): JSX.Element => {
  return readOnly ? (
    <Stack style={{ gap: '0' }}>
      <Text c='dimmed' fz='xs' fw={700}>
        {label}
      </Text>
      <Text fz='sm' lineClamp={20}>
        {value}
      </Text>
    </Stack>
  ) : textArea ? (
    <Textarea
      autosize
      minRows={5}
      label={label}
      placeholder={placeholder}
      required={required}
      withAsterisk={required}
      disabled={disabled}
      {...textAreaProps}
    />
  ) : (
    <TextInput
      label={label}
      placeholder={placeholder}
      type={numeric ? 'number' : 'text'}
      min={0}
      max={99}
      required={required}
      withAsterisk={required}
      disabled={disabled}
      {...textInputProps}
      onWheel={(e) => {
        e.currentTarget.blur()
      }}
    />
  )
}

export default FormTextField
