import api from "./axios";

const CHAT_BASE = "/chat";

export interface ChatUser {
  _id: string;
  name: string;
  email?: string;
  role?: "patient" | "doctor" | "admin";
  profilePicture?: string;
}

export interface ChatMessage {
  _id: string;

  conversation:
    | string
    | {
        _id: string;
      };

  sender: string | ChatUser;
  receiver?: string | ChatUser;

  // supporting different backend field names
  content?: string;
  message?: string;
  text?: string;

  read?: boolean;
  isRead?: boolean;

  createdAt: string;
  updatedAt?: string;
}

export interface ChatConversation {
  _id: string;

  participants?: ChatUser[];

  // Some APIs return this directly
  otherUser?: ChatUser;

  lastMessage?: ChatMessage | null;

  unreadCount?: number;

  createdAt?: string;
  updatedAt?: string;
}

const unwrapArray = <T>(
  data: any,
  key: string
): T[] => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.[key])) {
    return data[key];
  }

  return [];
};

export const getConversations = async (): Promise<
  ChatConversation[]
> => {
  const response = await api.get(
    `${CHAT_BASE}/conversations`
  );

  return unwrapArray<ChatConversation>(
    response.data,
    "conversations"
  );
};

export const getConversationMessages = async (
  conversationId: string
): Promise<ChatMessage[]> => {
  const response = await api.get(
    `${CHAT_BASE}/conversations/${conversationId}/messages`
  );

  return unwrapArray<ChatMessage>(
    response.data,
    "messages"
  );
};

export const sendChatMessage = async (
  conversationId: string,
  content: string
): Promise<ChatMessage> => {
  const response = await api.post(
    `${CHAT_BASE}/conversations/${conversationId}/messages`,
    {
      content,
    }
  );

  return response.data?.message ?? response.data;
};

export const markConversationRead = async (
  conversationId: string
) => {
  const response = await api.patch(
    `${CHAT_BASE}/conversations/${conversationId}/read`
  );

  return response.data;
};