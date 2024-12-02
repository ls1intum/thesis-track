export interface IGlobalConfig {
  title: string

  chair_name: string
  chair_url: string

  allow_suggested_topics: boolean

  server_host: string

  genders: Record<string, string>
  study_programs: Record<string, string>
  study_degrees: Record<string, string>
  languages: Record<string, string>

  thesis_types: Record<
    string,
    {
      long: string
      short: string
    }
  >

  custom_data: Record<
    string,
    {
      label: string
      required: boolean
    }
  >

  thesis_files: Record<
    string,
    {
      label: string
      description: string
      accept: UploadFileType
      required: boolean
    }
  >

  default_supervisors: string[]
  calendar_url: string

  keycloak: {
    client_id: string
    realm: string
    host: string
  }
}

export type UploadFileType = 'pdf' | 'image' | 'any'
