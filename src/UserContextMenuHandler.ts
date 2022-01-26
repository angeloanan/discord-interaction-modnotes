import { stripIndent } from 'common-tags'
import type {
  APIApplicationCommandInteraction,
  APIInteractionResponseChannelMessageWithSource,
  APIUserApplicationCommandInteractionData
} from 'discord-api-types'
import { InteractionResponseType, MessageFlags } from 'discord-api-types'
import type { Note } from './types'
import { errResponse, getDiscordUserData, JsonResponse } from './utils'

const handler = async (interactionData: APIApplicationCommandInteraction): Promise<Response> => {
  const commandData = interactionData.data as APIUserApplicationCommandInteractionData

  switch (commandData.name) {
    case 'Show Mod Notes': {
      const userNotes = ((await NOTES.get(commandData.target_id, 'json')) as Note[]) ?? []

      let modNotesBody = `🗒️ Showing mod notes for **<@${commandData.target_id}> (\`${commandData.target_id}\`)**\n\n`
      if (userNotes.length === 0) {
        modNotesBody += stripIndent`
          \`\`\`ansi
          [1;33mNo mod notes has been assigned to this user.
          \`\`\`
        `
      } else {
        await Promise.all(
          userNotes.map(async (note) => {
            const authorData = await getDiscordUserData(note.author)

            modNotesBody += stripIndent`
              ‣ ${authorData.username}#${authorData.discriminator} — <t:${note.timestamp}:R> 
              \`\`\`md
              ${note.content}
              \`\`\`
            `
          })
        )
      }

      const resBody: APIInteractionResponseChannelMessageWithSource = {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: modNotesBody,
          flags: MessageFlags.Ephemeral
        }
      }

      return JsonResponse(resBody)
    }

    default: {
      return errResponse({
        error: 'invalid command name'
      })
    }
  }
}

export default handler
