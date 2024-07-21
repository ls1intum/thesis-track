interface IFormatDateOptions {
  includeHours: boolean
}

export function formatDate(date: string | Date | undefined, options: Partial<IFormatDateOptions>): string {
  const { includeHours }: IFormatDateOptions = {
    includeHours: true,
    ...options
  }

  if (typeof date === 'undefined') {
    return ''
  }

  const item = new Date(date);

  return item.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: includeHours ? 'numeric' : undefined,
    minute: includeHours ? 'numeric' : undefined
  })
}