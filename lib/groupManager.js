import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'

const DATABASE_DIR = path.resolve('./database')
const DATABASE_PATH = path.join(DATABASE_DIR, 'grupos.json')

function ensureDatabase() {
  mkdirSync(DATABASE_DIR, { recursive: true })
  if (!existsSync(DATABASE_PATH)) writeFileSync(DATABASE_PATH, '{}')
}

function readGroups() {
  ensureDatabase()
  try {
    const data = JSON.parse(readFileSync(DATABASE_PATH, 'utf8'))
    return data && typeof data === 'object' ? data : {}
  } catch {
    return {}
  }
}

function writeGroups(groups) {
  ensureDatabase()
  writeFileSync(DATABASE_PATH, JSON.stringify(groups, null, 2))
}

export function getGroupConfig(groupId) {
  const groups = readGroups()
  return { antilink: false, ...(groups[groupId] || {}) }
}

export function toggleAntilink(groupId, status) {
  const groups = readGroups()
  groups[groupId] = { ...getGroupConfig(groupId), antilink: Boolean(status) }
  writeGroups(groups)
  return groups[groupId]
}

export default { getGroupConfig, toggleAntilink }
