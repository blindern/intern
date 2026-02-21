import { sql } from "drizzle-orm"
import {
  pgTable,
  varchar,
  text,
  boolean,
  date,
  jsonb,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

export const books = pgTable("books", {
  id: varchar("id", { length: 24 }).primaryKey(),
  title: varchar("title").notNull(),
  subtitle: varchar("subtitle"),
  authors: jsonb("authors").$type<string[]>(),
  pubdate: varchar("pubdate"),
  description: text("description"),
  isbn: varchar("isbn"),
  isbnData: jsonb("isbn_data").$type<Record<string, any> | null>(),
  thumbnail: varchar("thumbnail"),
  bibBarcode: varchar("bib_barcode"),
  bibComment: varchar("bib_comment"),
  bibRoom: varchar("bib_room"),
  bibSection: varchar("bib_section"),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 3 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
    .notNull()
    .defaultNow(),
})

export const bukker = pgTable("bukker", {
  id: varchar("id", { length: 24 }).primaryKey(),
  name: varchar("name").notNull(),
  died: varchar("died"),
  comment: varchar("comment"),
  awards: jsonb("awards").$type<
    {
      year: string
      rank: string
      image_file?: string
      devise?: string
      comment?: string
    }[]
  >(),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 3 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
    .notNull()
    .defaultNow(),
})

export const matmeny = pgTable("matmeny", {
  id: varchar("id", { length: 24 }).primaryKey(),
  day: date("day").unique().notNull(),
  text: text("text"),
  dishes: jsonb("dishes").$type<string[]>(),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 3 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
    .notNull()
    .defaultNow(),
})

export const googleappsAccounts = pgTable("googleapps_accounts", {
  id: varchar("id", { length: 24 }).primaryKey(),
  accountname: varchar("accountname").notNull(),
  group: varchar("group"),
  aliases: jsonb("aliases").$type<string[]>(),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 3 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, precision: 3 }),
})

export const googleappsAccountusers = pgTable(
  "googleapps_accountusers",
  {
    id: varchar("id", { length: 24 }).primaryKey(),
    accountId: varchar("account_id", { length: 24 })
      .notNull()
      .references(() => googleappsAccounts.id, { onDelete: "cascade" }),
    username: varchar("username").notNull(),
    notification: boolean("notification").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true, precision: 3 })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, precision: 3 }),
  },
  (table) => [
    uniqueIndex("googleapps_accountusers_account_username_unique")
      .on(table.accountId, table.username)
      .where(sql`deleted_at IS NULL`),
  ],
)

export const users = pgTable("users", {
  id: varchar("id", { length: 24 }).primaryKey(),
  username: varchar("username").unique().notNull(),
  rememberToken: varchar("remember_token"),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 3 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
    .notNull()
    .defaultNow(),
})

export const registrationRequests = pgTable("registration_requests", {
  id: varchar("id", { length: 24 }).primaryKey(),
  username: varchar("username").notNull(),
  firstname: varchar("firstname").notNull(),
  lastname: varchar("lastname").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  passwordHash: varchar("password_hash").notNull(),
  status: varchar("status").notNull().default("pending"),
  groupName: varchar("group_name"),
  processedBy: varchar("processed_by"),
  processedAt: timestamp("processed_at", {
    withTimezone: true,
    precision: 3,
  }),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 3 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
    .notNull()
    .defaultNow(),
})

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id", { length: 24 }).primaryKey(),
  tokenHash: varchar("token_hash").unique().notNull(),
  username: varchar("username").notNull(),
  email: varchar("email").notNull(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    precision: 3,
  }).notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 3 })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
    .notNull()
    .defaultNow(),
})
