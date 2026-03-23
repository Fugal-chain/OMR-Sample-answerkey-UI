import { createServer } from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadOmrSheetsFromDatabase } from './omrDb.js'

const PORT = Number(process.env.PORT || 3001)
const serverDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(serverDir, '..')

loadEnvironment()

function loadEnvironment() {
  const envPaths = [
    resolve(serverDir, '.env'),
    resolve(projectRoot, '.env'),
  ]

  for (const envPath of envPaths) {
    if (!existsSync(envPath)) continue

    const content = readFileSync(envPath, 'utf8')
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const separatorIndex = trimmed.indexOf('=')
      if (separatorIndex === -1) continue

      const key = trimmed.slice(0, separatorIndex).trim()
      const value = trimmed.slice(separatorIndex + 1).trim()
      if (!(key in process.env)) {
        process.env[key] = value
      }
    }
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(JSON.stringify(payload))
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    res.end()
    return
  }

  if (req.method === 'GET' && req.url?.startsWith('/api/omr-sheets')) {
    try {
      const payload = await loadOmrSheetsFromDatabase(process.env)
      sendJson(res, 200, payload)
    } catch (error) {
      sendJson(res, 500, {
        message: error.message || 'Failed to load OMR sheets from database.',
      })
    }
    return
  }

  sendJson(res, 404, { message: 'Not found' })
})

server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`)
})
