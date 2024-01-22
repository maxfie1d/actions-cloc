export function option(value: string): string[] {
  return value === '' ? [value] : []
}
