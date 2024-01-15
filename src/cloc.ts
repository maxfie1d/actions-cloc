export type ClocOutput = { header: Header } & LanguageStatsList

type LanguageStatsList = Record<string, RawLanguageStats>

type Header = {
  cloc_url: string
  cloc_version: string
  elapsed_seconds: number
  n_files: number
  n_lines: number
  files_per_second: number
  lines_per_second: number
}

type RawLanguageStats = {
  nFiles: number
  blank: number
  comment: number
  code: number
}

export type LanguageStats = { language: string } & RawLanguageStats
