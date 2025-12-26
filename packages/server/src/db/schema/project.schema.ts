import { relations } from "drizzle-orm"
import { uuid, pgTable, timestamp, varchar, jsonb } from "drizzle-orm/pg-core"
import { user } from "./auth.schema"
import type { Chat } from "@/types"

export const project = pgTable("project", {
    id: uuid().primaryKey().defaultRandom(), // unique id
    summary: varchar({ length: 255 }), // short project desc
    url: varchar(), // project url
    userId: uuid("user_id") // project creator id
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    image: varchar(),
    chatId: uuid("chat_id").unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
})

export const projectChats = pgTable("chats", {
    id: uuid().primaryKey().defaultRandom(),
    content: jsonb().$type<Chat[]>().default([]).notNull(),
    projectId: uuid("project_id").unique().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
})

// export const userRelations = relations(user, ({ many }) => ({ project: many(project) }))

export const projectRelations = relations(project, ({ one }) => ({
    user: one(user, { fields: [project.userId], references: [user.id] }),
    chats: one(projectChats, { fields: [project.chatId], references: [projectChats.id] }),
}))

export const projectChatsRelations = relations(projectChats, ({ one }) => ({
    project: one(project, { fields: [projectChats.projectId], references: [project.id] }),
}))
