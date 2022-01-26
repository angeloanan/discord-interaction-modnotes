import type { Snowflake } from 'discord-api-types'

declare global {
  const DISCORD_INTERACTION_PUBLIC_KEY: string
  const DISCORD_BOT_TOKEN: string

  const NOTES: KVNamespace
}

export interface Note {
  timestamp: number
  author: Snowflake
  lastEdited?: number
  content: string
}
