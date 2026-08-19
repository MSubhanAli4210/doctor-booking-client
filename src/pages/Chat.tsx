import { useEffect, useState } from 'react';
import api from '../api/axios';

interface Conversation {
  _id: string;
  patient?: { name: string };
  doctor?: { user: { name: string } };
  lastMessage?: string;
}

export default function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/chat/conversations');
        setConversations(res.data.conversations);
      } catch {
        console.error('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  if (loading) return <p className="text-center py-12 text-gray-500">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Messages</h1>

      {conversations.length === 0 && (
        <p className="text-gray-500">No conversations yet.</p>
      )}

      <div className="space-y-2">
        {conversations.map((c) => (
          <div key={c._id} className="border border-gray-100 rounded-lg p-4">
            <p className="font-medium text-gray-900">
              {c.patient?.name || c.doctor?.user?.name || 'Unknown'}
            </p>
            <p className="text-sm text-gray-500">{c.lastMessage || 'No messages yet'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}