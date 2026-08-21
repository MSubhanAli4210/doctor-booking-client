import api from "./axios";

const CHAT_BASE = "/chat";

export interface ChatUser {
  _id: string;
  name: string;
  email?: string;
  role?: "patient" | "doctor" | "admin";
  profilePicture?: string;
}

export interface ChatDoctor {
  _id: string;
  user: ChatUser;
  specialty?: string;
}

export interface ChatMessage {
  _id: string;
  conversation: string | { _id: string };
  sender: string | ChatUser;
  content: string;
  read?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatConversation {
  _id: string;

  patient: ChatUser;
  doctor: ChatDoctor;

  lastMessage?: string;
  lastMessageAt?: string;

  unreadCount?: number;

  createdAt?: string;
  updatedAt?: string;
}

export const startConversation = async (
  doctorId: string
): Promise<ChatConversation> => {
  const response = await api.post(
    `${CHAT_BASE}/conversations`,
    { doctorId }
  );

  return response.data.conversation;
};

export const getConversations = async (): Promise<
  ChatConversation[]
> => {
  const response = await api.get(
    `${CHAT_BASE}/conversations`
  );

  return response.data.conversations ?? [];
};

export const getConversationMessages = async (
  conversationId: string
): Promise<ChatMessage[]> => {
  const response = await api.get(
    `${CHAT_BASE}/conversations/${conversationId}/messages`
  );

  return response.data.messages ?? [];
};

export const sendChatMessage = async (
  conversationId: string,
  content: string
): Promise<ChatMessage> => {
  const response = await api.post(
    `${CHAT_BASE}/conversations/${conversationId}/messages`,
    { content }
  );

  return response.data.message;
};

export const markConversationRead = async (
  conversationId: string
) => {
  const response = await api.patch(
    `${CHAT_BASE}/conversations/${conversationId}/read`
  );

  return response.data;
};

export const getOnlineUsers = async (): Promise<string[]> => {
  const response = await api.get(
    `${CHAT_BASE}/online-status`
  );

  return response.data.onlineUserIds ?? [];
};

