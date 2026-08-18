export interface SendInput {
  userId: string;
  accountId: string;
  to: string;
  subject: string;
  body: string;
  conversationId: string;
}

export interface SendResult {
  provider: string;
  messageId: string;
}

export interface SyncResult {
  account: string;
  conversations: number;
  messages: number;
}

export interface SyncAllResult {
  userId: string;
  accountId: string;
  ok: boolean;
}

export interface CommunicationProvider {
  readonly name: string;
  send(input: SendInput): Promise<SendResult>;
  sync(accountId: string, userId: string): Promise<SyncResult>;
  syncAllConnected(): Promise<SyncAllResult[]>;
}
