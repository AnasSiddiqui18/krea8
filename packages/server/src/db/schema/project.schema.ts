import { relations } from "drizzle-orm"
import { uuid, pgTable, timestamp, varchar } from "drizzle-orm/pg-core"
import { user } from "./auth.schema"

export const project = pgTable("project", {
    id: uuid().primaryKey().defaultRandom(), // unique id
    summary: varchar({ length: 255 }), // short project desc
    url: varchar().notNull(), // project url
    userId: uuid("user_id") // project creator id
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
})

export const userRelations = relations(user, ({ many }) => ({ project: many(project) }))

export const projectRelations = relations(project, ({ one }) => ({
    user: one(user, { fields: [project.userId], references: [user.id] }),
}))
