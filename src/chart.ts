import { LanguageStats } from './cloc'

export function buildMermaidPieChart(
  title: string,
  stats: LanguageStats[]
): string {
  return `pie title ${title}
  ${stats.map(x => `    "${x.language}" : ${x.code}`).join(',\n')}
  `
}
