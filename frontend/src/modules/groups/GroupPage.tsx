import { ErrorPage } from "components/ErrorPage.js"
import { LoadingPage } from "components/LoadingPage.js"
import { useAuthInfo } from "modules/core/auth/AuthInfoProvider.js"
import { NotFoundError } from "modules/core/api/errors.js"
import { PageTitle } from "modules/core/title/PageTitle.js"
import { UserLink } from "modules/users/UserLink.js"
import { IndirectMemberInfo } from "modules/users/UserPage.js"
import { useUserList } from "modules/users/api.js"
import { Link, useParams } from "react-router-dom"
import { listGroupsUrl } from "utils/urls.js"
import {
  GroupDetail,
  useAddMemberMutation,
  useAddOwnerMutation,
  useGroup,
  useGroupList,
  useRemoveMemberMutation,
  useRemoveOwnerMutation,
} from "./api.js"
import { GroupLink } from "./GroupLink.js"
import { type ReactNode, useState } from "react"

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
            href="#"
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

function TypeSelect({
  value,
  onChange,
}: {
  value: "users" | "groups"
  onChange: (v: "users" | "groups") => void
}) {
  return (
    <select
      className="form-control input-sm"
      style={{ width: "auto", flexShrink: 0 }}
      value={value}
      onChange={(e) => onChange(e.target.value as "users" | "groups")}
    >
      <option value="users">Bruker</option>
      <option value="groups">Gruppe</option>
    </select>
  )
}

function useSearchableItems(
  type: "users" | "groups",
  search: string,
  excludeUsers: Set<string>,
  excludeGroups: Set<string>,
  excludeGroupName?: string,
) {
  const { data: users } = useUserList()
  const { data: groups } = useGroupList()

  if (type === "users") {
    return (users ?? [])
      .filter(
        (u) =>
          !excludeUsers.has(u.username) &&
          (u.username.toLowerCase().includes(search.toLowerCase()) ||
            (u.realname ?? "").toLowerCase().includes(search.toLowerCase())),
      )
      .slice(0, 10)
      .map((u) => ({
        id: u.username,
        label: `${u.username} — ${u.realname}`,
      }))
  }

  return (groups ?? [])
    .filter(
      (g) =>
        g.name !== excludeGroupName &&
        !excludeGroups.has(g.name) &&
        g.name.toLowerCase().includes(search.toLowerCase()),
    )
    .slice(0, 10)
    .map((g) => ({ id: g.name, label: g.name }))
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
  const items = useSearchableItems(
    entityType,
    search,
    excludeUsers,
    excludeGroups,
    excludeGroupName,
  )

  return (
    <div style={{ marginTop: 10, maxWidth: 400, position: "relative" }}>
      <div style={{ display: "flex", gap: 4 }}>
        <TypeSelect
          value={entityType}
          onChange={(v) => {
            setEntityType(v)
            setSearch("")
          }}
        />
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
      className="btn btn-xs btn-danger"
      disabled={isPending}
      onClick={() => {
        if (window.confirm(label)) {
          onConfirm()
        }
      }}
    >
      Fjern
    </button>
  )
}

function OwnerListItem({
  ownerType,
  ownerId,
  label,
  removeOwner,
}: {
  ownerType: "users" | "groups"
  ownerId: string
  label: ReactNode
  removeOwner: ReturnType<typeof useRemoveOwnerMutation>
}) {
  const confirmMsg =
    ownerType === "groups"
      ? `Fjerne gruppen ${ownerId} som administrator?`
      : `Fjerne ${ownerId} som administrator?`
  return (
    <li>
      {label}{" "}
      <RemoveButton
        label={confirmMsg}
        isPending={removeOwner.isPending}
        onConfirm={() => removeOwner.mutate({ ownerType, ownerId })}
      />
    </li>
  )
}

function Detail({
  group,
  canManage,
}: {
  group: GroupDetail
  canManage: boolean
}) {
  const [isEditing, setEditing] = useState(false)
  const addMember = useAddMemberMutation(group.name)
  const removeMember = useRemoveMemberMutation(group.name)
  const addOwner = useAddOwnerMutation(group.name)
  const removeOwner = useRemoveOwnerMutation(group.name)

  return (
    <>
      <PageTitle title={`Gruppe: ${group.name}`} />

      {canManage && (
        <div className="pull-right">
          <button
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
            {group.members.map((member) => {
              const isDirect =
                member.group_relations[group.name]?.includes(group.name) ??
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
                    <IndirectMemberInfo user={member} group={group} />
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

      {group.members_real.groups.length > 0 && (
        <>
          <h3>Grupper som er medlemmer</h3>
          <p>Medlemmer i disse gruppene er også medlemmer av denne gruppa.</p>
          <ul>
            {group.members_real.groups.map((groupName) => (
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
          excludeUsers={new Set(group.members.map((m) => m.username))}
          excludeGroups={new Set(group.members_real.groups)}
          excludeGroupName={group.name}
          onAdd={(type, id) =>
            addMember.mutate({ memberType: type, memberId: id })
          }
        />
      )}

      <h2>Administratorer</h2>
      {group.owners.groups.length === 0 && group.owners.users.length === 0 ? (
        <p>Ingen administratorer er satt.</p>
      ) : (
        <ul>
          {group.owners.groups.map((groupName) =>
            isEditing ? (
              <OwnerListItem
                key={groupName}
                ownerType="groups"
                ownerId={groupName}
                label={<GroupLink groupName={groupName} />}
                removeOwner={removeOwner}
              />
            ) : (
              <li key={groupName}>
                <GroupLink groupName={groupName} />
              </li>
            ),
          )}
          {group.owners.users.map((username) =>
            isEditing ? (
              <OwnerListItem
                key={username}
                ownerType="users"
                ownerId={username}
                label={<UserLink username={username} />}
                removeOwner={removeOwner}
              />
            ) : (
              <li key={username}>
                <UserLink username={username} />
              </li>
            ),
          )}
        </ul>
      )}

      {isEditing && (
        <AddEntityForm
          placeholder="Legg til administrator..."
          isPending={addOwner.isPending}
          excludeUsers={new Set(group.owners.users)}
          excludeGroups={new Set(group.owners.groups)}
          excludeGroupName={group.name}
          onAdd={(type, id) =>
            addOwner.mutate({ ownerType: type, ownerId: id })
          }
        />
      )}
    </>
  )
}

export function GroupPage() {
  const { name } = useParams()
  const auth = useAuthInfo()

  const { isPending, isError, error, data } = useGroup(name!)

  if (error instanceof NotFoundError) {
    return (
      <>
        <PageTitle title="Ukjent gruppe" />
        <p>Gruppen er ikke registrert</p>
        <p>
          <Link to={listGroupsUrl()}>Til oversikten</Link>
        </p>
      </>
    )
  }

  if (isPending) {
    return <LoadingPage title="Laster gruppe ..." />
  }

  if (isError && data == null) {
    return <ErrorPage error={error} title="Feil ved lasting av gruppe" />
  }

  const canManage =
    auth.data.isLoggedIn &&
    (auth.data.isUserAdmin ||
      Object.prototype.hasOwnProperty.call(
        auth.data.user.groupowner_relations ?? {},
        data.name,
      ))

  return <Detail group={data} canManage={canManage} />
}
