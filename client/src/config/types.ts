export interface IGlobalConfig {
  title: string

  server_host: string

  focus_topics: Record<string, string>
  research_areas: Record<string, string>
  genders: Record<string, string>
  study_programs: Record<string, string>
  study_degrees: Record<string, string>
  thesis_types: Record<string, string>

  default_supervisors: string[]

  keycloak: {
    client_id: string
    realm: string
    host: string
    university_id_jwt_attribute: string
  }
}
