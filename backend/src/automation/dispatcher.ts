import { getProviderOrThrow } from "../integrations/registry.js";
import { AppError } from "../errors/index.js";

export async function dispatchFollowUp(input: {
  userId: string;
  accountId: string;
  provider: string;
  to: string;
  subject: string;
  body: string;
  conversationId: string;
}): Promise<{ provider: string; messageId: string }> {
  let provider;
  try {
    provider = getProviderOrThrow(input.provider);
  } catch {
    throw new AppError(`Communication provider "${input.provider}" is not configured`, 400);
  }
  return provider.send({
    userId: input.userId,
    accountId: input.accountId,
    to: input.to,
    subject: input.subject,
    body: input.body,
    conversationId: input.conversationId,
  });
}
