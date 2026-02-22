import { Link } from "@tanstack/react-router"
import { IndirectMemberInfo } from "../../components/IndirectMemberInfo.js"
import { CommaSeparated } from "../../components/CommaSeparated.js"
import { Loading } from "../../components/Loading.js"
import { GroupLink } from "../../components/GroupLink.js"
import type { UsersApiUser } from "../../server/users-api.js"
import { useGroupList, useUser } from "./hooks.js"
import { PageTitle } from "../../hooks/useTitle.js"

function GroupsSection({ user }: { user: UsersApiUser }) {
  const { data: allGroups } = useGroupList()
  const groupDescriptions = new Map(
    (allGroups ?? []).map((g) => [g.name ?? g.unique_id, g.description]),
  )

  if (!user.groups || user.groups.length === 0) {
    return (
      <>
        <h2>Grupper</h2>
        <p>
          <i>Ingen grupper</i>
        </p>
      </>
    )
  }

  return (
    <>
      <h2>Grupper</h2>
      <table
        className="table table-striped nowrap table-condensed"
        style={{ width: "auto" }}
      >
        <thead>
          <tr>
            <th>Gruppe</th>
            <th>Beskrivelse</th>
          </tr>
        </thead>
        <tbody>
          {user.groups.map((group: string) => {
            const description = groupDescriptions.get(group) ?? ""
            return (
              <tr key={group}>
                <td>
                  <GroupLink groupName={group} />
                </td>
                <td>
                  {description}
                  <IndirectMemberInfo
                    groupsRelation={user.groups_relation}
                    groupName={group}
                    hasDescription={!!description}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

export function UserPage({ name }: { name: string }) {
  const { isPending, isError, data: user } = useUser(name)

  if (isPending)
    return (
      <>
        <PageTitle title="Laster bruker ..." />
        <Loading />
      </>
    )
  if (isError && user == null) {
    return (
      <>
        <PageTitle title="Ukjent bruker" />
        <p>Brukeren er ikke registrert</p>
        <p>
          <Link to="/users">Til oversikten</Link>
        </p>
      </>
    )
  }

  return (
    <>
      <PageTitle title={user.realname ?? user.username} />
      <ul>
        <li>Brukernavn: {user.username}</li>
        <li>Navn: {user.realname}</li>
        <li>
          E-post:{" "}
          {user.email ? (
            <a href={`mailto:${user.email}`}>{user.email}</a>
          ) : (
            "Ukjent"
          )}
        </li>
        {user.phone && (
          <li>
            Mobil: <a href={`tel:${user.phone}`}>{user.phone}</a>
          </li>
        )}
      </ul>

      <GroupsSection user={user} />

      {user.groupsowner_relation &&
        Object.keys(user.groupsowner_relation).length > 0 && (
          <>
            <h2>Administrator for</h2>
            <ul>
              {Object.entries(user.groupsowner_relation).map(
                ([groupName, from]) => (
                  <li key={groupName}>
                    <GroupLink groupName={groupName} /> (delegert fra{" "}
                    <CommaSeparated>
                      {from.map((n) => (
                        <GroupLink key={n} groupName={n} />
                      ))}
                    </CommaSeparated>
                    )
                  </li>
                ),
              )}
            </ul>
          </>
        )}
    </>
  )
}
