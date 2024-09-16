import { Select, SelectProps, Text } from '@mantine/core'

const ThesisVisibilitySelect = (props: SelectProps) => {
  const { ...others } = props

  const descriptions: Record<string, string> = {
    PUBLIC:
      'Every authenticated user can see the thesis. If thesis is completed, it will be publicly visible on the landing page',
    STUDENT: 'All students that have a not completed thesis assigned can see the thesis',
    INTERNAL: 'All advisors and supervisors of the chair can see the thesis',
    PRIVATE: 'Only assigned users can see the thesis',
  }

  return (
    <Select
      {...others}
      renderOption={({ option }) => (
        <div>
          <Text size='sm'>{option.label || option.value}</Text>
          <Text size='xs' c='dimmed'>
            {descriptions[option.value]}
          </Text>
        </div>
      )}
      data={[
        { value: 'PUBLIC', label: 'Public' },
        { value: 'STUDENT', label: 'Thesis Students' },
        { value: 'INTERNAL', label: 'Internal' },
        { value: 'PRIVATE', label: 'Private' },
      ]}
    />
  )
}

export default ThesisVisibilitySelect
