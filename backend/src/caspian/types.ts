export interface CaspianChannel {
  id: string;
  name: string;
  type: string;
}

export interface CaspianConnection {
  id: string;
  channel: string;
  capabilities: string[];
  status: string;
  address: string | null;
  customer_id: string;
  agent_id: string;
  error: string | null;
}

export interface CaspianConversation {
  id: string;
  connection_id: string;
  subject: string | null;
  created_at: string;
}

export interface CaspianParticipant {
  address: string;
  name: string | null;
}

export interface CaspianMessage {
  id: string;
  conversation_id: string;
  connection_id: string;
  channel: string;
  direction: string;
  status: string;
  sender: CaspianParticipant | null;
  recipients: CaspianParticipant[];
  subject: string | null;
  text: string | null;
  html: string | null;
  sent_at?: string;
  created_at?: string;
}
