import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { DefaultArtifactClient } from '@actions/artifact'
import { ClocOutput, LanguageStats } from './cloc'
import * as fs from 'fs'
import { buildMermaidPieChart } from './chart'
import { option } from './cli'

export async function run(): Promise<void> {
  await exec.exec('sudo apt', ['install', '-y', 'cloc'])

  const commonOptions = ['--vcs=git', '--json', '--out=cloc-output.json']
  const excludeLangOption = option(
    '--exclude-lang',
    core.getInput('exclude-lang')
  )
  const mergedOptions = [...commonOptions, ...excludeLangOption]
  await exec.exec('cloc', mergedOptions)

  const clocResult = JSON.parse(
    fs.readFileSync('./cloc-output.json', 'utf8')
  ) as ClocOutput

  const keys = Object.keys(clocResult).filter(x => x !== 'header')
  const series = keys.map(key => {
    const metric = clocResult[key]
    return {
      language: key,
      nFiles: metric.nFiles,
      blank: metric.blank,
      comment: metric.comment,
      code: metric.code
    } as LanguageStats
  })

  // Generate summary
  const summary = core.summary
  summary.addHeading('cloc')
  const headerRow = [
    { data: 'Language', header: true },
    { data: 'nFiles', header: true },
    { data: 'blank', header: true },
    { data: 'comment', header: true },
    { data: 'code', header: true }
  ]
  const otherRows = series.map(x => [
    x.language,
    x.nFiles.toLocaleString(),
    x.blank.toLocaleString(),
    x.comment.toLocaleString(),
    x.code.toLocaleString()
  ])
  const allRows = [headerRow, ...otherRows]
  summary.addTable(allRows)

  const chart = buildMermaidPieChart('LOC', series)
  summary.addCodeBlock(chart, 'mermaid')

  summary.write()

  // Upload result as artifact
  const uploadArtifact = core.getBooleanInput('artifact')
  const artifactName = core.getInput('artifact-name')
  if (uploadArtifact) {
    const artifact = new DefaultArtifactClient()
    const { id, size } = await artifact.uploadArtifact(
      artifactName,
      ['./cloc-output.json'],
      '.'
    )

    console.log(`Created artifact with id: ${id} (bytes: ${size})`)
  }
}
