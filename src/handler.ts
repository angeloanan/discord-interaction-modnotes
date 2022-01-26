import { errResponse, hasPermission, JsonResponse, verifyDiscordSig } from './utils'
import type { APIApplicationCommandInteraction, APIPingInteraction } from 'discord-api-types'
import { InteractionType, InteractionResponseType, ApplicationCommandType } from 'discord-api-types'
import UserContextMenuHandler from './UserContextMenuHandler'
import SlashCommandHandler from './SlashCommandHandler'

export async function handleRequest(req: Request): Promise<Response> {
  if (!req.headers.get('X-Signature-Ed25519') || !req.headers.get('X-Signature-Timestamp'))
    return Response.redirect('https://angeloanan.xyz')
  if (!(await verifyDiscordSig(req))) return errResponse({ error: 'invalid request signature' })

  const interactionData = (await req.json()) as
    | APIPingInteraction
    | APIApplicationCommandInteraction
  if (interactionData.type === InteractionType.Ping) {
    return JsonResponse({
      type: InteractionResponseType.Pong
    })
  } else if (interactionData.type !== InteractionType.ApplicationCommand) {
    return errResponse({
      error: 'invalid interaction type'
    })
  }

  if (!hasPermission(parseInt(interactionData.member?.permissions ?? '0')))
    return errResponse({
      error: 'Not enough permission'
    })

  try {
    switch (interactionData.data.type as ApplicationCommandType) {
      // Slash commands
      case ApplicationCommandType.ChatInput:
        return SlashCommandHandler(interactionData)

      // UI-button - User
      case ApplicationCommandType.User:
        return UserContextMenuHandler(interactionData)

      // catch all
      default: {
        return errResponse({
          error: 'invalid interaction type'
        })
      }
    }
  } catch (e) {
    console.error(e)
    return errResponse(
      {
        error: 'internal server error'
      },
      500
    )
  }
}
