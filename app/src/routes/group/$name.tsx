import { createFileRoute, Link } from "@tanstack/react-router"
import { IndirectMemberInfo } from "../../components/IndirectMemberInfo.js"
import { Loading } from "../../components/Loading.js"
import { GroupLink } from "../../components/GroupLink.js"
import { UserLink } from "../../components/UserLink.js"
import { useAuthInfo } from "../../features/auth/hooks.js"
import {
  useGroup,
  useGroupList,
  useAddMemberMutation,
  useRemoveMemberMutation,
  useAddOwnerMutation,
  useRemoveOwnerMutation,
  useUserList,
} from "../../features/users/hooks.js"
import { PageTitle } from "../../hooks/useTitle.js"

import { useState } from "react"

export const Route = createFileRoute("/group/$name")({
  component: GroupPage,
})

function SearchDropdown({
  items,
  onSelect,
}: {
  items: { id: string; label: string }[]
  onSelect: (id: string) => void
}) {
  if (items.length === 0) return null
  return (
    <ul
      className="dropdown-menu"
      style={{
        display: "block",
        width: "100%",
        maxHeight: 200,
        overflowY: "auto",
      }}
    >
      {items.map((item) => (
        <li key={item.id}>
          <a
            role="button"
            onMouseDown={(e) => {
              e.preventDefault()
              onSelect(item.id)
            }}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  )
}

function AddEntityForm({
  placeholder,
  isPending,
  excludeUsers,
  excludeGroups,
  excludeGroupName,
  onAdd,
}: {
  placeholder: string
  isPending: boolean
  excludeUsers: Set<string>
  excludeGroups: Set<string>
  excludeGroupName?: string
  onAdd: (type: "users" | "groups", id: string) => void
}) {
  const [entityType, setEntityType] = useState<"users" | "groups">("users")
  const [search, setSearch] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const { data: users } = useUserList()
  const { data: groups } = useGroupList()

  const items =
    entityType === "users"
      ? (users ?? [])
          .filter(
            (u) =>
              !excludeUsers.has(u.username) &&
              (u.username.toLowerCase().includes(search.toLowerCase()) ||
                (u.realname ?? "")
                  .toLowerCase()
                  .includes(search.toLowerCase())),
          )
          .slice(0, 10)
          .map((u) => ({
            id: u.username,
            label: `${u.username} — ${u.realname}`,
          }))
      : (groups ?? [])
          .filter((g) => {
            const name = g.name ?? g.unique_id
            return (
              name !== excludeGroupName &&
              !excludeGroups.has(name) &&
              name.toLowerCase().includes(search.toLowerCase())
            )
          })
          .slice(0, 10)
          .map((g) => ({
            id: g.name ?? g.unique_id,
            label: g.name ?? g.unique_id,
          }))

  return (
    <div style={{ marginTop: 10, maxWidth: 400, position: "relative" }}>
      <div style={{ display: "flex", gap: 4 }}>
        <select
          className="form-control input-sm"
          style={{ width: "auto", flexShrink: 0 }}
          value={entityType}
          onChange={(e) => {
            setEntityType(e.target.value as any)
            setSearch("")
          }}
        >
          <option value="users">Bruker</option>
          <option value="groups">Gruppe</option>
        </select>
        <input
          type="text"
          className="form-control input-sm"
          placeholder={placeholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          disabled={isPending}
        />
      </div>
      {showDropdown && search.length > 0 && (
        <SearchDropdown
          items={items}
          onSelect={(id) => {
            setSearch("")
            setShowDropdown(false)
            onAdd(entityType, id)
          }}
        />
      )}
    </div>
  )
}

function RemoveButton({
  label,
  isPending,
  onConfirm,
}: {
  label: string
  isPending: boolean
  onConfirm: () => void
}) {
  return (
    <button
      type="button"
      className="btn btn-xs btn-danger"
      disabled={isPending}
      onClick={() => {
        if (window.confirm(label)) onConfirm()
      }}
    >
      Fjern
    </button>
  )
}

function GroupPage() {
  const { name } = Route.useParams()
  const auth = useAuthInfo()
  const { isPending, isError, data: group } = useGroup(name)
  const [isEditing, setEditing] = useState(false)
  const addMember = useAddMemberMutation(name)
  const removeMember = useRemoveMemberMutation(name)
  const addOwner = useAddOwnerMutation(name)
  const removeOwner = useRemoveOwnerMutation(name)

  if (isPending)
    return (
      <>
        <PageTitle title="Laster gruppe ..." />
        <Loading />
      </>
    )
  if (isError && group == null) {
    return (
      <>
        <PageTitle title="Ukjent gruppe" />
        <p>Gruppen er ikke registrert</p>
        <p>
          <Link to="/groups">Til oversikten</Link>
        </p>
      </>
    )
  }

  const canManage =
    auth.data.isLoggedIn &&
    (auth.data.isUserAdmin ||
      Object.prototype.hasOwnProperty.call(
        auth.data.user.groupsowner_relation ?? {},
        group.name ?? "",
      ))

  return (
    <>
      <PageTitle title={`Gruppe: ${group.name ?? group.unique_id}`} />

      {canManage && (
        <div className="pull-right">
          <button
            type="button"
            className="btn btn-sm btn-default"
            onClick={() => setEditing(!isEditing)}
          >
            {isEditing ? "Avslutt redigering" : "Rediger"}
          </button>
        </div>
      )}

      <dl>
        <dt>Gruppenavn</dt>
        <dd>{group.name}</dd>
        <dt>GruppeID</dt>
        <dd>{group.id}</dd>
        <dt>Beskrivelse</dt>
        <dd>{group.description}</dd>
      </dl>

      <h2>
        Medlemmer
        {group.members.length > 0 && <> ({group.members.length} stk)</>}
      </h2>

      {group.members.length > 0 && (
        <table
          className="table table-striped table-condensed"
          style={{ width: "auto" }}
        >
          <thead>
            <tr>
              <th>Bruker</th>
              <th>Navn</th>
              {isEditing && <th />}
            </tr>
          </thead>
          <tbody>
            {group.members.map((member: any) => {
              const groupName = group.name ?? group.unique_id
              const isDirect =
                member.groups_relation?.[groupName]?.includes(groupName) ??
                false
              return (
                <tr
                  key={member.username}
                  style={{ opacity: !isDirect ? 0.5 : 1 }}
                >
                  <td>
                    <UserLink username={member.username} />
                  </td>
                  <td>
                    {member.realname}
                    <IndirectMemberInfo
                      groupsRelation={member.groups_relation}
                      groupName={groupName}
                    />
                  </td>
                  {isEditing && (
                    <td>
                      {isDirect && (
                        <RemoveButton
                          label={`Fjerne ${member.username} fra ${group.name}?`}
                          isPending={removeMember.isPending}
                          onConfirm={() =>
                            removeMember.mutate({
                              memberType: "users",
                              memberId: member.username,
                            })
                          }
                        />
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {group.members.length === 0 && <p>Ingen medlemmer i gruppa</p>}

      {(group.members_real?.groups?.length ?? 0) > 0 && (
        <>
          <h3>Grupper som er medlemmer</h3>
          <p>Medlemmer i disse gruppene er også medlemmer av denne gruppa.</p>
          <ul>
            {group.members_real!.groups.map((groupName: string) => (
              <li key={groupName}>
                <GroupLink groupName={groupName} />
                {isEditing && (
                  <>
                    {" "}
                    <RemoveButton
                      label={`Fjerne gruppen ${groupName} som medlem?`}
                      isPending={removeMember.isPending}
                      onConfirm={() =>
                        removeMember.mutate({
                          memberType: "groups",
                          memberId: groupName,
                        })
                      }
                    />
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {isEditing && (
        <AddEntityForm
          placeholder="Legg til medlem..."
          isPending={addMember.isPending}
          excludeUsers={new Set(group.members.map((m: any) => m.username))}
          excludeGroups={new Set(group.members_real?.groups ?? [])}
          excludeGroupName={group.name}
          onAdd={(type, id) =>
            addMember.mutate({ memberType: type, memberId: id })
          }
        />
      )}

      <h2>Administratorer</h2>
      {(group.owners?.groups?.length ?? 0) === 0 &&
      (group.owners?.users?.length ?? 0) === 0 ? (
        <p>Ingen administratorer er satt.</p>
      ) : (
        <ul>
          {group.owners?.groups?.map((groupName: string) => (
            <li key={groupName}>
              <GroupLink groupName={groupName} />
              {isEditing && (
                <>
                  {" "}
                  <RemoveButton
                    label={`Fjerne gruppen ${groupName} som administrator?`}
                    isPending={removeOwner.isPending}
                    onConfirm={() =>
                      removeOwner.mutate({
                        ownerType: "groups",
                        ownerId: groupName,
                      })
                    }
                  />
                </>
              )}
            </li>
          ))}
          {group.owners?.users?.map((username: string) => (
            <li key={username}>
              <UserLink username={username} />
              {isEditing && (
                <>
                  {" "}
                  <RemoveButton
                    label={`Fjerne ${username} som administrator?`}
                    isPending={removeOwner.isPending}
                    onConfirm={() =>
                      removeOwner.mutate({
                        ownerType: "users",
                        ownerId: username,
                      })
                    }
                  />
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {isEditing && (
        <AddEntityForm
          placeholder="Legg til administrator..."
          isPending={addOwner.isPending}
          excludeUsers={new Set(group.owners?.users ?? [])}
          excludeGroups={new Set(group.owners?.groups ?? [])}
          excludeGroupName={group.name}
          onAdd={(type, id) =>
            addOwner.mutate({ ownerType: type, ownerId: id })
          }
        />
      )}
    </>
  )
}
