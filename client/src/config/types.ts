export interface IGlobalConfig {
  title: string

  chair_name: string
  chair_url: string

  allow_suggested_topics: boolean

  server_host: string

  genders: Record<string, string>
  study_programs: Record<string, string>
  study_degrees: Record<string, string>
  thesis_types: Record<string, string>
  custom_data: Record<string, string>
  languages: Record<string, string>

  privacy_text: string
  imprint_text: string

  default_supervisors: string[]
  calendar_url: string

  keycloak: {
    client_id: string
    realm: string
    host: string
  }
}
