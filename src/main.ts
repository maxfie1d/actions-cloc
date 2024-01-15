import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { DefaultArtifactClient } from '@actions/artifact'
import * as fs from 'fs'

export async function run(): Promise<void> {
  await exec.exec('sudo apt', ['install', '-y', 'cloc'])
  await exec.exec('cloc', ['--vcs=git', '--json', '--out=cloc-output.json'])

  const clocResult = JSON.parse(fs.readFileSync('./cloc-output.json', 'utf8'))

  const keys = Object.keys(clocResult).filter(x => x !== 'header')
  const series = keys.map(key => {
    const metric = clocResult[key]
    return {
      language: key,
      nFiles: metric.nFiles,
      blank: metric.blank,
      comment: metric.comment,
      code: metric.code
    }
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
    x.nFiles.toString(),
    x.blank.toString(),
    x.comment.toString(),
    x.code.toString()
  ])
  const allRows = [headerRow, ...otherRows]
  summary.addTable(allRows)
  summary.write()

  // Upload result as artifact
  const artifact = new DefaultArtifactClient()
  const { id, size } = await artifact.uploadArtifact(
    'cloc-output',
    ['./cloc-output.json'],
    '.'
  )

  console.log(`Created artifact with id: ${id} (bytes: ${size}`)
}
