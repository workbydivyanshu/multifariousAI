import { auth } from "@/lib/auth";
import db, { isDbConnected } from "@/db/drizzle";
import { chat } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getChatConversations, getConversationMessages } from "./chat";

export async function shareChat(chatId: string) {
  if (!isDbConnected()) {
    // For local-only mode, generate a basic share URL but note sharing won't persist
    console.log("Database not connected - sharing requires database for persistence");
    return {
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shared/${chatId}`,
      chat: null,
      warning: 'Sharing requires database connection. Chat shared locally only.',
    };
  }
  
  try {
    const session = await auth.api.getSession({
      headers: await import("next/headers").then(m => m.headers()),
    });

    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    // Update chat visibility to public
    const [updatedChat] = await db!
      .update(chat)
      .set({ visibility: "public" })
      .where(eq(chat.id, chatId))
      .returning();

    // Generate shareable URL
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shared/${chatId}`;

    return {
      shareUrl,
      chat: updatedChat,
    };
  } catch (error) {
    console.error("Failed to share chat:", error);
    throw error;
  }
}

export async function getSharedChat(chatId: string) {
  if (!isDbConnected()) {
    console.log("Database not connected - cannot retrieve shared chat");
    return null;
  }
  
  try {
    const [sharedChat] = await db!
      .select()
      .from(chat)
      .where(eq(chat.id, chatId));

    if (!sharedChat || sharedChat.visibility !== "public") {
      return null;
    }

    return sharedChat;
  } catch (error) {
    console.error("Failed to get shared chat:", error);
    return null;
  }
}

// Re-export conversation functions for shared views
export { getChatConversations, getConversationMessages } from "./chat";