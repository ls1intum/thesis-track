import { GLOBAL_CONFIG } from '../../config/global'
import { Select } from '@mantine/core'
import { formatLanguage } from '../../utils/format'
import { SelectProps } from '@mantine/core/lib/components/Select/Select'

const LanguageSelect = (props: Omit<SelectProps, 'data'>) => {
  return (
    <Select
      label='Language'
      data={Object.keys(GLOBAL_CONFIG.languages).map((key) => ({
        label: formatLanguage(key),
        value: key,
      }))}
      {...props}
    />
  )
}

export default LanguageSelect
