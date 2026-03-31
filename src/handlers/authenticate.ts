import { MetabaseApiClient, RuntimeCredentials } from '../api.js';

export async function handleAuthenticate(
  params: { username: string; password: string },
  sessionId: string,
  sessionClients: Map<string, MetabaseApiClient>
): Promise<{ content: { type: string; text: string }[] }> {
  const credentials: RuntimeCredentials = {
    username: params.username,
    password: params.password,
  };

  const client = new MetabaseApiClient(credentials);

  // Validate credentials immediately by obtaining a session token
  await client.getSessionToken();

  sessionClients.set(sessionId, client);

  return {
    content: [
      {
        type: 'text',
        text: `Authenticated as ${params.username}. Credentials stored for this session.`,
      },
    ],
  };
}
