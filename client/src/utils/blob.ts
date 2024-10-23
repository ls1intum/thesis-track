export function downloadFile(file: File) {
  const url = window.URL.createObjectURL(file)

  const a = document.createElement('a')
  a.href = url
  a.setAttribute('download', `${file.name}`)

  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  a.remove()
}
