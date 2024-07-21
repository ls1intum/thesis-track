export function downloadPdf(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.setAttribute('download', `${filename}.pdf`)

  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
}
