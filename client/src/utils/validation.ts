export type PartialNull<T> = {
  [P in keyof T]: T[P] | null
}

export function isNotEmptyUserList(group: 'student' | 'advisor' | 'supervisor') {
  return (values: string[]) => {
    if (values.length === 0) {
      return `You must select at least one ${group}`
    }
  }
}

export function getHtmlTextLength(html: string | undefined) {
  if (!html) {
    return 0
  }

  const doc = new DOMParser().parseFromString(html, 'text/html')

  return doc.body.textContent?.length || 0
}
