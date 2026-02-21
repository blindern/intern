import { createFileRoute, Link } from "@tanstack/react-router"
import { CommaSeparated } from "../../components/CommaSeparated.js"
import { Loading } from "../../components/Loading.js"
import { GroupLink } from "../../components/GroupLink.js"
import { useGroupList } from "../../features/users/hooks-groups.js"
import { useUser } from "../../features/users/hooks.js"
import { PageTitle } from "../../hooks/useTitle.js"
import { listUsersUrl } from "../../utils/urls.js"

export const Route = createFileRoute("/user/$name")({
  component: UserPage,
})

function IndirectMemberInfo({
  groupsRelation,
  groupName,
  hasDescription,
}: {
  groupsRelation?: Record<string, string[]>
  groupName: string
  hasDescription: boolean
}) {
  if (!groupsRelation || !(groupName in groupsRelation)) return null
  const groups = groupsRelation[groupName]
  if (groups.includes(groupName)) return null

  return (
    <>
      {hasDescription && <br />}
      <span className="text-muted">
        (Indirekte medlem gjennom{" "}
        <CommaSeparated>
          {groups.map((n) => (
            <GroupLink key={n} groupName={n} />
          ))}
        </CommaSeparated>
        )
      </span>
    </>
  )
}

function GroupsSection({ user }: { user: any }) {
  const { data: allGroups } = useGroupList()
  const groupDescriptions = new Map(
    (allGroups ?? []).map((g: any) => [g.name ?? g.unique_id, g.description]),
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

function UserPage() {
  const { name } = Route.useParams()
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
          <Link to={listUsersUrl()}>Til oversikten</Link>
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
