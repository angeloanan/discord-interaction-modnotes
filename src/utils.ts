import type { APIInteractionResponse, RESTGetAPIUserResult } from 'discord-api-types'

export const errResponse = (data: Record<string, unknown>, status = 400): Response => {
  console.log('Sending ERROR reply', data)

  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const JsonResponse = (data: APIInteractionResponse): Response => {
  console.log('Sending JSON reply', data)

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const hasPermission = (permissionNumber: number): boolean => {
  console.log('Calculating permission', permissionNumber)
  const allowed =
    (permissionNumber & 0x2) === 0x2 || // Kick Members
    (permissionNumber & 0x4) === 0x4 || // Ban Members
    (permissionNumber & 0x8) === 0x8 || // Administrator
    (permissionNumber & 0x20) === 0x20 || // Manage Server
    (permissionNumber & 0x2000) === 0x2000 // Manage Messages

  return allowed
}

export const getDiscordUserData = async (userId: string): Promise<RESTGetAPIUserResult> => {
  const res = await fetch(`https://discord.com/api/v9/users/${userId}`, {
    headers: {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`
    }
  })

  return res.json()
}

// Function to verify Discord's Signature below

function hexToBinary(hex: string) {
  const buf = new Uint8Array(Math.ceil(hex.length / 2))
  for (let i = 0; i < buf.length; i++) {
    buf[i] = parseInt(hex.substr(i * 2, 2), 16)
  }
  return buf
}

const PUBLIC_KEY = crypto.subtle.importKey(
  'raw',
  hexToBinary(DISCORD_INTERACTION_PUBLIC_KEY),
  {
    name: 'NODE-ED25519',
    namedCurve: 'NODE-ED25519'
  },
  true,
  ['verify']
)

const encoder = new TextEncoder()

export async function verifyDiscordSig(request: Request): Promise<boolean> {
  const rawSig = request.headers.get('X-Signature-Ed25519')
  if (rawSig == null) return false

  const signature = hexToBinary(rawSig)
  const timestamp = request.headers.get('X-Signature-Timestamp')
  const unknown = await request.clone().text()

  return await crypto.subtle.verify(
    'NODE-ED25519',
    await PUBLIC_KEY,
    signature,
    encoder.encode(timestamp + unknown)
  )
}
