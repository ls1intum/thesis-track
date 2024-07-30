import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'

countries.registerLocale(enLocale)

export const AVAILABLE_COUNTRIES = countries.getNames('en', { select: 'alias' })
