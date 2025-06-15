import { users, documents, type User, type InsertUser, type Document, type InsertDocument } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: number): Promise<Document | undefined>;
  updateDocument(id: number, editedText: string): Promise<Document | undefined>;
  getUserDocuments(userId: number): Promise<Document[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values({
        ...insertDocument,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return document;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async updateDocument(id: number, editedText: string): Promise<Document | undefined> {
    const [document] = await db
      .update(documents)
      .set({ 
        editedText,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id))
      .returning();
    return document || undefined;
  }

  async getUserDocuments(userId: number): Promise<Document[]> {
    // If userId is 0, return all documents (for when no auth is implemented)
    if (userId === 0) {
      return await db.select().from(documents);
    }
    return await db.select().from(documents).where(eq(documents.userId, userId));
  }
}

export const storage = new DatabaseStorage();
