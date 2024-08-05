export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.setAttribute('download', filename)

  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
}
