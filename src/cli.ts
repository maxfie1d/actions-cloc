export function option(key: string, value: string): string[] {
  return value !== '' ? [`${key}=${value}`] : []
}
