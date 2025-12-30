import { auth } from "@/lib/auth";
import db, { isDbConnected } from "@/db/drizzle";
import { chat, conversation, message } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { AiModel } from "@/types";

// Note: When database is not available, these functions return empty results
// or throw errors. Use local storage (via chat-store.ts) for local-only mode.

export async function getUserChats() {
  if (!isDbConnected()) {
    console.log("Database not connected - using local storage for chats");
    return [];
  }
  
  try {
    const session = await auth.api.getSession({
      headers: await import("next/headers").then(m => m.headers()),
    });

    if (!session?.user?.id) {
      return [];
    }

    const userChats = await db!
      .select()
      .from(chat)
      .where(eq(chat.userId, session.user.id))
      .orderBy(desc(chat.createdAt));

    return userChats;
  } catch (error) {
    console.error("Failed to get user chats:", error);
    return [];
  }
}

export async function createChat(title: string = "New Chat") {
  if (!isDbConnected()) {
    console.log("Database not connected - chats are saved locally");
    return { id: `local-${Date.now()}`, title, userId: 'local-user', createdAt: new Date() };
  }
  
  try {
    const session = await auth.api.getSession({
      headers: await import("next/headers").then(m => m.headers()),
    });

    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const [newChat] = await db!
      .insert(chat)
      .values({
        userId: session.user.id,
        title,
      })
      .returning();

    return newChat;
  } catch (error) {
    console.error("Failed to create chat:", error);
    throw error;
  }
}

export async function updateChatTitle(chatId: string, title: string) {
  if (!isDbConnected()) {
    console.log("Database not connected - update handled locally");
    return { id: chatId, title };
  }
  
  try {
    const session = await auth.api.getSession({
      headers: await import("next/headers").then(m => m.headers()),
    });

    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const [updatedChat] = await db!
      .update(chat)
      .set({ title })
      .where(eq(chat.id, chatId))
      .returning();

    return updatedChat;
  } catch (error) {
    console.error("Failed to update chat title:", error);
    throw error;
  }
}

export async function deleteChat(chatId: string) {
  if (!isDbConnected()) {
    console.log("Database not connected - deletion handled locally");
    return;
  }
  
  try {
    const session = await auth.api.getSession({
      headers: await import("next/headers").then(m => m.headers()),
    });

    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    await db!.delete(chat).where(eq(chat.id, chatId));
  } catch (error) {
    console.error("Failed to delete chat:", error);
    throw error;
  }
}

export async function getChatConversations(chatId: string) {
  if (!isDbConnected()) {
    return [];
  }
  
  try {
    const session = await auth.api.getSession({
      headers: await import("next/headers").then(m => m.headers()),
    });

    if (!session?.user?.id) {
      return [];
    }

    const chatConversations = await db!
      .select()
      .from(conversation)
      .where(eq(conversation.chatId, chatId))
      .orderBy(desc(conversation.createdAt));

    return chatConversations;
  } catch (error) {
    console.error("Failed to get chat conversations:", error);
    return [];
  }
}

export async function createConversation(chatId: string, model: AiModel) {
  if (!isDbConnected()) {
    return { id: `local-conv-${Date.now()}`, chatId, model, createdAt: new Date() };
  }
  
  try {
    const session = await auth.api.getSession({
      headers: await import("next/headers").then(m => m.headers()),
    });

    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const [newConversation] = await db!
      .insert(conversation)
      .values({
        chatId,
        model,
      })
      .returning();

    return newConversation;
  } catch (error) {
    console.error("Failed to create conversation:", error);
    throw error;
  }
}

export async function getConversationMessages(conversationId: string) {
  if (!isDbConnected()) {
    return [];
  }
  
  try {
    const session = await auth.api.getSession({
      headers: await import("next/headers").then(m => m.headers()),
    });

    if (!session?.user?.id) {
      return [];
    }

    const messages = await db!
      .select()
      .from(message)
      .where(eq(message.conversationId, conversationId))
      .orderBy(message.createdAt);

    return messages;
  } catch (error) {
    console.error("Failed to get conversation messages:", error);
    return [];
  }
}

export async function addMessage(conversationId: string, role: string, parts: any) {
  if (!isDbConnected()) {
    return { id: `local-msg-${Date.now()}`, conversationId, role, parts, createdAt: new Date() };
  }
  
  try {
    const session = await auth.api.getSession({
      headers: await import("next/headers").then(m => m.headers()),
    });

    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const [newMessage] = await db!
      .insert(message)
      .values({
        conversationId,
        role,
        parts,
      })
      .returning();

    return newMessage;
  } catch (error) {
    console.error("Failed to add message:", error);
    throw error;
  }
}