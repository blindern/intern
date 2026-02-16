import crypto from "node:crypto"
import { env } from "./env.js"

function generateHmacV2(
  time: string,
  method: string,
  uri: string,
  body: string,
): string {
  const data = `${method}\n${uri}\n${time}\n${body}`
  return crypto.createHmac("sha256", env.usersApiKey).update(data).digest("hex")
}

async function apiRequest(
  method: string,
  path: string,
  body?: unknown,
): Promise<unknown> {
  const url = `${env.usersApiUrl}${path}`
  const time = Math.floor(Date.now() / 1000).toString()
  const bodyStr = body ? JSON.stringify(body) : ""
  const hash = generateHmacV2(time, method, path, bodyStr)

  const headers: Record<string, string> = {
    "X-API-Hash": hash,
    "X-API-Time": time,
    "X-API-Hash-Version": "2",
    Accept: "application/json",
  }

  if (body) {
    headers["Content-Type"] = "application/json"
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? bodyStr : undefined,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Users API ${method} ${path} failed: ${res.status} ${text}`)
  }

  if (res.status === 204) return undefined

  return res.json()
}

// Legacy endpoints return { result: ... } wrapper
async function legacyGet(path: string): Promise<any> {
  const data = (await apiRequest("GET", `/${path}`)) as any
  return data.result
}

export interface UsersApiUser {
  username: string
  realname?: string
  email?: string
  phone?: string
  groups: string[]
  groups_relation?: Record<string, string[]>
  groupsowner_relation?: Record<string, string[]>
}

/**
 * Normalize user data from the users-api.
 *
 * The users-api returns groups as objects with grouplevel=2 but omits
 * them with grouplevel=1. The old Laravel backend derived a string[]
 * from groups_relation keys. We do the same here so `groups` is always
 * a string array of group names.
 */
function normalizeUser(raw: any): UsersApiUser {
  let groups: string[]
  if (raw.groups_relation) {
    groups = Object.keys(raw.groups_relation)
  } else if (Array.isArray(raw.groups)) {
    groups = raw.groups.map((g: any) =>
      typeof g === "string" ? g : (g.unique_id ?? g.name),
    )
  } else {
    groups = []
  }
  return { ...raw, groups }
}

export interface UsersApiGroup {
  unique_id: string
  name?: string
  description?: string
  members: UsersApiUser[]
  members_relation?: Record<string, string[]>
  members_real?: { users: string[]; groups: string[] }
  owners?: { users: string[]; groups: string[] }
}

/**
 * Normalize group data from the users-api.
 *
 * The raw API returns `members` as `{users: [], groups: []}` and
 * `members_data` as a map of username → user object. The old Laravel
 * backend transformed this so `members` was a user object array and
 * the raw structure was renamed to `members_real`. We replicate that.
 */
function normalizeGroup(raw: any): UsersApiGroup {
  const membersData: Record<string, any> = raw.members_data ?? {}
  const members = Object.values(membersData).map(normalizeUser)
  const membersReal = raw.members ?? { users: [], groups: [] }
  const { members_data: _, members: __, ...rest } = raw
  return { ...rest, members, members_real: membersReal }
}

export const usersApi = {
  async getUsers(): Promise<UsersApiUser[]> {
    const users = await legacyGet("users?grouplevel=1")
    return (users as any[]).map(normalizeUser)
  },

  async getUser(username: string): Promise<UsersApiUser | null> {
    try {
      const user = await legacyGet(`user/${username}?grouplevel=2`)
      return normalizeUser(user)
    } catch (err) {
      console.error(`[users-api] getUser(${username}) failed:`, err)
      return null
    }
  },

  async getGroups(): Promise<UsersApiGroup[]> {
    return legacyGet("groups")
  },

  async getGroup(groupname: string): Promise<UsersApiGroup | null> {
    try {
      const group = await legacyGet(`group/${groupname}`)
      return normalizeGroup(group)
    } catch {
      return null
    }
  },

  async verifyCredentials(
    username: string,
    password: string,
  ): Promise<boolean> {
    try {
      await apiRequest("POST", "/v2/simpleauth", {
        username,
        password,
      })
      return true
    } catch {
      return false
    }
  },

  async createUser(userData: {
    username: string
    firstName: string
    lastName: string
    email: string
    phone?: string | null
    passwordHash: string
  }): Promise<void> {
    await apiRequest("POST", "/v2/users", userData)
  },

  async modifyUser(
    username: string,
    changes: Record<string, unknown>,
  ): Promise<void> {
    await apiRequest("POST", `/v2/users/${username}/modify`, changes)
  },

  async addGroupMember(
    groupName: string,
    memberType: string,
    memberId: string,
  ): Promise<void> {
    await apiRequest(
      "PUT",
      `/v2/groups/${groupName}/members/${memberType}/${memberId}`,
    )
  },

  async removeGroupMember(
    groupName: string,
    memberType: string,
    memberId: string,
  ): Promise<void> {
    await apiRequest(
      "DELETE",
      `/v2/groups/${groupName}/members/${memberType}/${memberId}`,
    )
  },

  async addGroupOwner(
    groupName: string,
    ownerType: string,
    ownerId: string,
  ): Promise<void> {
    await apiRequest(
      "PUT",
      `/v2/groups/${groupName}/owners/${ownerType}/${ownerId}`,
    )
  },

  async removeGroupOwner(
    groupName: string,
    ownerType: string,
    ownerId: string,
  ): Promise<void> {
    await apiRequest(
      "DELETE",
      `/v2/groups/${groupName}/owners/${ownerType}/${ownerId}`,
    )
  },
}
