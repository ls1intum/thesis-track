interface Window {
  RUNTIME_ENVIRONMENT_VARIABLES: Record<string, string> | undefined
}

interface WindowEventMap {
  'local-storage': StorageEvent
}
