import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { SubmitEvent } from "react";

import {
  getConversationMessages,
  getConversations,
  markConversationRead,
  sendChatMessage,
} from "../api/chatApi";

import type { ChatConversation, ChatMessage, ChatUser } from "../api/chatApi";

import { connectChatSocket, disconnectChatSocket } from "../lib/chatSocket";

const getStoredUserId = (): string => {
  try {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsed = JSON.parse(storedUser);

      if (parsed?._id) return parsed._id;
      if (parsed?.id) return parsed.id;
    }
  } catch {}

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken");

  if (!token) return "";

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    return payload._id || payload.id || payload.userId || "";
  } catch {
    return "";
  }
};

const getUserId = (user?: string | ChatUser | null) => {
  if (!user) return "";

  return typeof user === "string" ? user : user._id;
};

const getMessageConversationId = (message: ChatMessage) => {
  if (typeof message.conversation === "string") {
    return message.conversation;
  }

  return message.conversation?._id || "";
};

const getMessageText = (message?: ChatMessage | null) => {
  if (!message) return "";

  return message.content || message.message || message.text || "";
};

const getOtherUser = (
  conversation: ChatConversation,
  currentUserId: string,
): ChatUser | undefined => {
  if (conversation.otherUser) {
    return conversation.otherUser;
  }

  return conversation.participants?.find(
    (participant) => participant._id !== currentUserId,
  );
};

const getInitials = (name?: string) => {
  if (!name) return "?";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const formatMessageTime = (date?: string) => {
  if (!date) return "";

  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatConversationTime = (date?: string) => {
  if (!date) return "";

  const messageDate = new Date(date);
  const today = new Date();

  const sameDay =
    messageDate.getDate() === today.getDate() &&
    messageDate.getMonth() === today.getMonth() &&
    messageDate.getFullYear() === today.getFullYear();

  if (sameDay) {
    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return messageDate.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
};

const Chat = () => {
  const currentUserId = useMemo(() => getStoredUserId(), []);

  const [conversations, setConversations] = useState<ChatConversation[]>([]);

  const [activeConversation, setActiveConversation] =
    useState<ChatConversation | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [messageInput, setMessageInput] = useState("");

  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const [loadingConversations, setLoadingConversations] = useState(true);

  const [loadingMessages, setLoadingMessages] = useState(false);

  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

  const activeConversationIdRef = useRef<string>("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    activeConversationIdRef.current = activeConversation?._id || "";
  }, [activeConversation]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const addMessageIfMissing = useCallback((message: ChatMessage) => {
    setMessages((previous) => {
      const exists = previous.some((item) => item._id === message._id);

      if (exists) return previous;

      return [...previous, message];
    });
  }, []);

  const updateConversationWithMessage = useCallback(
    (message: ChatMessage) => {
      const conversationId = getMessageConversationId(message);

      if (!conversationId) return;

      const senderId = getUserId(message.sender);

      setConversations((previous) => {
        const updated = previous.map((conversation) => {
          if (conversation._id !== conversationId) {
            return conversation;
          }

          const isActive = activeConversationIdRef.current === conversationId;

          const receivedFromOtherUser = senderId !== currentUserId;

          return {
            ...conversation,

            lastMessage: message,

            updatedAt: message.createdAt || new Date().toISOString(),

            unreadCount:
              receivedFromOtherUser && !isActive
                ? (conversation.unreadCount || 0) + 1
                : conversation.unreadCount || 0,
          };
        });

        return updated.sort((a, b) => {
          const aDate = new Date(a.updatedAt || 0).getTime();

          const bDate = new Date(b.updatedAt || 0).getTime();

          return bDate - aDate;
        });
      });
    },
    [currentUserId],
  );

  const loadConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      setError("");

      const data = await getConversations();

      setConversations(data);

      if (data.length > 0 && !activeConversationIdRef.current) {
        setActiveConversation(data[0]);
      }
    } catch (error) {
      console.error(error);
      setError("Unable to load conversations.");
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const socket = connectChatSocket();

    const handleNewMessage = (
      payload: ChatMessage | { message: ChatMessage },
    ) => {
      const incomingMessage: ChatMessage =
        "_id" in payload ? payload : payload.message;

      if (!incomingMessage?._id) return;

      const conversationId = getMessageConversationId(incomingMessage);

      updateConversationWithMessage(incomingMessage);

      if (conversationId === activeConversationIdRef.current) {
        addMessageIfMissing(incomingMessage);

        markConversationRead(conversationId).catch(console.error);
      }
    };

    const handleUserOnline = (
      payload:
        | string
        | {
            userId?: string;
            _id?: string;
          },
    ) => {
      const userId =
        typeof payload === "string"
          ? payload
          : payload.userId || payload._id || "";

      if (!userId) return;

      setOnlineUsers((previous) => {
        const next = new Set(previous);
        next.add(userId);
        return next;
      });
    };

    const handleUserOffline = (
      payload:
        | string
        | {
            userId?: string;
            _id?: string;
          },
    ) => {
      const userId =
        typeof payload === "string"
          ? payload
          : payload.userId || payload._id || "";

      if (!userId) return;

      setOnlineUsers((previous) => {
        const next = new Set(previous);
        next.delete(userId);
        return next;
      });
    };

    socket.on("newMessage", handleNewMessage);

    socket.on("userOnline", handleUserOnline);

    socket.on("userOffline", handleUserOffline);

    socket.on("onlineUsers", (users: string[]) => {
      setOnlineUsers(new Set(users));
    });

    return () => {
      socket.off("newMessage", handleNewMessage);

      socket.off("userOnline", handleUserOnline);

      socket.off("userOffline", handleUserOffline);

      disconnectChatSocket();
    };
  }, [addMessageIfMissing, updateConversationWithMessage]);

  useEffect(() => {
    if (!activeConversation?._id) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        setError("");

        const data = await getConversationMessages(activeConversation._id);

        setMessages(data);

        setConversations((previous) =>
          previous.map((conversation) =>
            conversation._id === activeConversation._id
              ? {
                  ...conversation,
                  unreadCount: 0,
                }
              : conversation,
          ),
        );

        await markConversationRead(activeConversation._id);
      } catch (error) {
        console.error(error);

        setError("Unable to load messages.");
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [activeConversation?._id]);

  const handleSendMessage = async (event: SubmitEvent) => {
    event.preventDefault();

    const content = messageInput.trim();

    if (!content || !activeConversation || sending) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const message = await sendChatMessage(activeConversation._id, content);

      const normalizedMessage: ChatMessage = {
        ...message,

        conversation: message.conversation || activeConversation._id,
      };

      addMessageIfMissing(normalizedMessage);

      updateConversationWithMessage(normalizedMessage);

      setMessageInput("");
    } catch (error) {
      console.error(error);

      setError("Message could not be sent.");
    } finally {
      setSending(false);
    }
  };

  const activeOtherUser = activeConversation
    ? getOtherUser(activeConversation, currentUserId)
    : undefined;

  const activeUserOnline =
    activeOtherUser && onlineUsers.has(activeOtherUser._id);

  return (
    <div className="min-h-[calc(100vh-70px)] bg-slate-50 p-4 md:p-6">
      <div className="mx-auto grid h-[calc(100vh-120px)] min-h-[600px] max-w-7xl grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-[340px_1fr]">
        {/* Sidebar */}

        <aside className="flex min-w-0 flex-col border-r border-slate-200">
          <div className="flex h-[74px] items-center justify-between border-b border-slate-200 px-5">
            <h2 className="text-xl font-bold text-slate-900">Messages</h2>

            <button
              onClick={loadConversations}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xl transition hover:bg-slate-200"
            >
              ↻
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingConversations && (
              <div className="flex h-full items-center justify-center p-8 text-sm text-slate-500">
                Loading conversations...
              </div>
            )}

            {!loadingConversations && conversations.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <div className="mb-3 text-4xl">💬</div>

                <p className="font-medium text-slate-700">
                  No conversations yet
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Start chatting with a doctor or patient.
                </p>
              </div>
            )}

            {conversations.map((conversation) => {
              const otherUser = getOtherUser(conversation, currentUserId);

              const isOnline = !!otherUser && onlineUsers.has(otherUser._id);

              const isActive = activeConversation?._id === conversation._id;

              return (
                <button
                  key={conversation._id}
                  onClick={() => setActiveConversation(conversation)}
                  className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-4 text-left transition ${
                    isActive ? "bg-blue-50" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="relative shrink-0">
                    {otherUser?.profilePicture ? (
                      <img
                        src={otherUser.profilePicture}
                        alt={otherUser.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                        {getInitials(otherUser?.name)}
                      </div>
                    )}

                    {isOnline && (
                      <span
                        className="
                        bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 absolute
      "
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-semibold text-slate-900">
                        {otherUser?.name || "Conversation"}
                      </p>

                      <span className="shrink-0 text-[11px] text-slate-400">
                        {formatConversationTime(
                          conversation.lastMessage?.createdAt ||
                            conversation.updatedAt,
                        )}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="truncate text-sm text-slate-500">
                        {getMessageText(conversation.lastMessage) ||
                          "No messages yet"}
                      </p>

                      {!!conversation.unreadCount &&
                        conversation.unreadCount > 0 && (
                          <span className="flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            {conversation.unreadCount}
                          </span>
                        )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Chat */}

        <main className="flex min-h-0 min-w-0 flex-col">
          {!activeConversation ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-3 text-5xl">💬</div>

              <h2 className="text-xl font-bold text-slate-900">
                Your Messages
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select a conversation to start chatting.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}

              <div className="flex h-[74px] shrink-0 items-center border-b border-slate-200 px-5">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {activeOtherUser?.profilePicture ? (
                      <img
                        src={activeOtherUser.profilePicture}
                        alt={activeOtherUser.name}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                        {getInitials(activeOtherUser?.name)}
                      </div>
                    )}

                    {activeUserOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {activeOtherUser?.name || "Conversation"}
                    </h3>

                    <p
                      className={`text-xs ${
                        activeUserOnline ? "text-green-500" : "text-slate-400"
                      }`}
                    >
                      {activeUserOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}

              <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6">
                {loadingMessages ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-2 text-4xl">👋</div>

                    <p className="font-medium text-slate-700">
                      No messages yet
                    </p>

                    <p className="text-sm text-slate-400">
                      Send the first message.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const mine = getUserId(message.sender) === currentUserId;

                    return (
                      <div
                        key={message._id}
                        className={`mb-3 flex ${
                          mine ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 md:max-w-[65%] ${
                            mine
                              ? "rounded-br-md bg-blue-600 text-white"
                              : "rounded-bl-md border border-slate-200 bg-white text-slate-900"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                            {getMessageText(message)}
                          </p>

                          <div
                            className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                              mine ? "text-blue-100" : "text-slate-400"
                            }`}
                          >
                            <span>{formatMessageTime(message.createdAt)}</span>

                            {mine && (
                              <span>
                                {message.read || message.isRead ? "✓✓" : "✓"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                <div ref={messagesEndRef} />
              </div>

              {error && (
                <div className="border-t border-red-200 bg-red-50 px-5 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Input */}

              <form
                onSubmit={handleSendMessage}
                className="flex shrink-0 items-end gap-3 border-t border-slate-200 bg-white p-4"
              >
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();

                      handleSendMessage(e as unknown as SubmitEvent);
                    }
                  }}
                  rows={1}
                  maxLength={2000}
                  placeholder="Type a message..."
                  className="min-h-[46px] flex-1 resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="submit"
                  disabled={!messageInput.trim() || sending}
                  className="h-[46px] rounded-xl bg-blue-600 px-6 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Chat;
