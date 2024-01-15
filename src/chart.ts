import { LanguageStats } from './cloc'

export function buildMermaidPieChart(
  title: string,
  stats: LanguageStats[]
): string {
  return `pie showData title ${title}
  ${stats
    .filter(x => x.language !== 'SUM')
    .map(x => `    "${x.language}" : ${x.code}`)
    .join('\n')}
  `
}
