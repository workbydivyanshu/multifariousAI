import { notFound } from "next/navigation";
import { getSharedChat, getChatConversations, getConversationMessages } from "@/actions/share";
import { SharedChatView } from "@/components/shared/shared-chat-view";

interface SharedChatPageProps {
  params: Promise<{ id: string }>;
}

export default async function SharedChatPage({ params }: SharedChatPageProps) {
  const { id } = await params;

  const chat = await getSharedChat(id);

  if (!chat) {
    notFound();
  }

  // Load conversations and messages
  const conversations = await getChatConversations(id);
  const messages: any[] = [];

  for (const conv of conversations) {
    const convMessages = await getConversationMessages(conv.id);
    convMessages.forEach((msg) => {
      const msgContent = Array.isArray((msg as any).parts)
        ? (msg as any).parts.map((p: any) => p.text || '').join('')
        : String((msg as any).parts || '');
      messages.push({
        id: msg.id,
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msgContent,
        timestamp: new Date(msg.createdAt).getTime(),
        model: conv.model.id,
      });
    });
  }

  return (
    <SharedChatView
      chat={chat}
      messages={messages.sort((a, b) => a.timestamp - b.timestamp)}
    />
  );
}