import { CommaSeparated } from "components/CommaSeparated.js"
import { ErrorPage } from "components/ErrorPage.js"
import { LoadingPage } from "components/LoadingPage.js"
import { NotFoundError } from "modules/core/api/errors.js"
import { Group, UserDetails, UserDetailsFull } from "modules/core/auth/types.js"
import { PageTitle } from "modules/core/title/PageTitle.js"
import { GroupLink } from "modules/groups/GroupLink.js"
import { useUser } from "modules/users/api.js"
import React from "react"
import { Link, useParams } from "react-router-dom"
import { listUsersUrl } from "utils/urls.js"

export const IndirectMemberInfo = ({
  user,
  group,
}: {
  user: Pick<UserDetails, "group_relations">
  group: Pick<Group, "name" | "description">
}) => {
  if (!(group.name in user.group_relations)) {
    return null
  }

  const groups = user.group_relations[group.name]!

  if (groups.includes(group.name)) {
    return null
  }

  return (
    <>
      {group.description && <br />}
      <span className="text-muted">
        (Indirekte medlem gjennom{" "}
        <CommaSeparated>
          {user.group_relations[group.name]!.map((n) => (
            <GroupLink key={n} groupName={n} />
          ))}
        </CommaSeparated>
        )
      </span>
    </>
  )
}

const Detail = ({ user }: { user: UserDetailsFull }) => (
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

    <h2>Grupper</h2>
    {user.groups.length === 0 ? (
      <p>
        <i>Ingen grupper</i>
      </p>
    ) : (
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
          {user.groups.map((group) => (
            <tr key={group.name}>
              <td>
                <GroupLink groupName={group.name} />
              </td>
              <td>
                {group.description}
                <IndirectMemberInfo user={user} group={group} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}

    {Object.keys(user.groupowner_relations).length > 0 && (
      <>
        <h2>Administrator for</h2>
        <ul>
          {Object.entries(user.groupowner_relations).map(([name, from]) => (
            <li key={name}>
              <GroupLink groupName={name} /> (delegert fra{" "}
              <CommaSeparated>
                {from.map((n) => (
                  <GroupLink key={n} groupName={n} />
                ))}
              </CommaSeparated>
              )
            </li>
          ))}
        </ul>
      </>
    )}
  </>
)

export const UserPage = () => {
  const { name } = useParams()

  const { isLoading, isError, error, data } = useUser(name!)

  if (error instanceof NotFoundError) {
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

  if (isLoading) {
    return <LoadingPage title="Laster bruker ..." />
  }

  if (isError && data == null) {
    return <ErrorPage error={error} title="Feil ved lasting av bruker" />
  }

  return <Detail user={data} />
}
