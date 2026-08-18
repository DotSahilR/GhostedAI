import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import type { ConnectedAccount, NewConnectedAccount } from "../schema/index.js";
import { connectedAccounts } from "../schema/index.js";

export const connectedAccountRepository = {
  async create(data: NewConnectedAccount): Promise<ConnectedAccount> {
    const [row] = await db.insert(connectedAccounts).values(data).returning();
    return row as ConnectedAccount;
  },

  async findById(id: string, userId: string): Promise<ConnectedAccount | null> {
    const [row] = await db
      .select()
      .from(connectedAccounts)
      .where(and(eq(connectedAccounts.id, id), eq(connectedAccounts.userId, userId)));
    return row ?? null;
  },

  async findByProviderExternal(
    userId: string,
    provider: string,
    externalId: string,
  ): Promise<ConnectedAccount | null> {
    const [row] = await db
      .select()
      .from(connectedAccounts)
      .where(
        and(
          eq(connectedAccounts.userId, userId),
          eq(connectedAccounts.provider, provider as ConnectedAccount["provider"]),
          eq(connectedAccounts.externalId, externalId),
        ),
      );
    return row ?? null;
  },

  async listByUser(userId: string): Promise<ConnectedAccount[]> {
    return db
      .select()
      .from(connectedAccounts)
      .where(eq(connectedAccounts.userId, userId))
      .orderBy(desc(connectedAccounts.createdAt));
  },

  async listAllByProvider(provider: string): Promise<ConnectedAccount[]> {
    return db
      .select()
      .from(connectedAccounts)
      .where(eq(connectedAccounts.provider, provider as ConnectedAccount["provider"]))
      .orderBy(desc(connectedAccounts.createdAt));
  },

  async update(
    id: string,
    userId: string,
    data: Partial<NewConnectedAccount>,
  ): Promise<ConnectedAccount | null> {
    const [row] = await db
      .update(connectedAccounts)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(connectedAccounts.id, id), eq(connectedAccounts.userId, userId)))
      .returning();
    return row ?? null;
  },

  async remove(id: string, userId: string): Promise<boolean> {
    const rows = await db
      .delete(connectedAccounts)
      .where(and(eq(connectedAccounts.id, id), eq(connectedAccounts.userId, userId)))
      .returning({ id: connectedAccounts.id });
    return rows.length > 0;
  },
};
