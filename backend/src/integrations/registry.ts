import { caspianProvider } from "./providers/caspian-provider.js";
import { gmailProvider } from "./providers/gmail-provider.js";
import type { CommunicationProvider } from "./types.js";

const providers = new Map<string, CommunicationProvider>([
  ["caspian", caspianProvider],
  ["gmail", gmailProvider],
]);

export function getProvider(name: string): CommunicationProvider | undefined {
  return providers.get(name);
}

export function getProviderOrThrow(name: string): CommunicationProvider {
  const provider = providers.get(name);
  if (!provider) {
    throw new Error(`No communication provider registered for "${name}"`);
  }
  return provider;
}
