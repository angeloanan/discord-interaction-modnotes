// import { stripIndent } from 'common-tags'
import type {
  APIApplicationCommandInteraction,
  APIApplicationCommandInteractionDataSubcommandOption,
  APIChatInputApplicationCommandInteractionData
} from 'discord-api-types'
import { InteractionResponseType, MessageFlags } from 'discord-api-types'
import type { Note } from './types'
import { errResponse, JsonResponse } from './utils'

const handler = async (interaction: APIApplicationCommandInteraction): Promise<Response> => {
  const interactionData = interaction.data as APIChatInputApplicationCommandInteractionData
  const commandData = interactionData
    .options?.[0] as APIApplicationCommandInteractionDataSubcommandOption
  console.log('Current interactionData', interaction)

  if (interactionData.name !== 'modnotes') return errResponse({ error: 'invalid command name' })
  if (commandData == null) return errResponse({ error: 'invalid sub-command name' })
  if (interaction.member == null) return errResponse({ error: 'must be in server' })

  const options = new Map()
  for (const o of commandData.options ?? []) {
    options.set(o.name, o)
  }

  switch (commandData.name) {
    case 'add': {
      const targetUserId = options.get('user').value

      // Pull data, append, insert
      const currentNote = (await NOTES.get<Note[]>(targetUserId, 'json')) ?? []
      currentNote.push({
        author: interaction.member.user.id,
        timestamp: Math.round(new Date().getTime() / 1000),
        content: options.get('content').value
      })
      await NOTES.put(targetUserId, JSON.stringify(currentNote))

      return JsonResponse({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: 'Modnote successfully added',
          flags: MessageFlags.Ephemeral
        }
      })
    }

    case 'delete': {
      return JsonResponse({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          flags: MessageFlags.Ephemeral
        }
      })
    }

    case 'edit': {
      return JsonResponse({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          flags: MessageFlags.Ephemeral
        }
      })
    }

    default: {
      return errResponse({ error: 'not implemented' })
    }
  }
}

export default handler
