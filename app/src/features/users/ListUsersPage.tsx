import { CommaSeparated } from "../../components/CommaSeparated.js"
import { ErrorMessages } from "../../components/ErrorMessages.js"
import { Loading } from "../../components/Loading.js"
import { GroupLink } from "../../components/GroupLink.js"
import { UserLink } from "../../components/UserLink.js"
import { useUserList } from "./hooks.js"
import { PageTitle } from "../../hooks/useTitle.js"
import "../../styles/pages/users.scss"

type UserDetails = Awaited<ReturnType<typeof useUserList>>["data"] extends
  | (infer T)[]
  | undefined
  ? T
  : never

function realnameFallback(user: UserDetails) {
  return user.realname ?? user.username
}

function compareByRealname(a: UserDetails, b: UserDetails) {
  return realnameFallback(a).localeCompare(realnameFallback(b))
}

export function ListUsersPage() {
  const { isPending, isError, error, data: userList } = useUserList()

  if (isPending)
    return (
      <>
        <PageTitle title="Brukerliste" />
        <Loading />
      </>
    )
  if (isError && userList == null)
    return (
      <>
        <PageTitle title="Brukerliste" />
        <ErrorMessages error={error} />
      </>
    )

  const beboere: UserDetails[] = []
  const others: UserDetails[] = []
  const utflyttede: UserDetails[] = []

  for (const user of userList) {
    const groups = user.groups ?? []
    if (groups.includes("beboer")) beboere.push(user)
    else if (groups.includes("utflyttet")) utflyttede.push(user)
    else others.push(user)
  }

  beboere.sort(compareByRealname)
  others.sort(compareByRealname)
  utflyttede.sort(compareByRealname)

  const sections = [
    { title: "Beboere", users: beboere },
    { title: "Andre brukere", users: others },
    { title: "Utflyttede", users: utflyttede },
  ]

  return (
    <>
      <PageTitle title="Brukerliste" />
      <p>
        Denne brukerlisten kan ses av alle innloggede brukere. Totalt eksisterer
        det {userList.length} brukere i systemet.
      </p>
      {sections.map((section, idx) => (
        <div key={idx} className="user-list-section panel panel-info">
          <div className="panel-heading">
            {section.title} ({section.users.length} stk)
          </div>
          <table className="table table-striped table-hover table-condensed">
            <thead>
              <tr>
                <th>Brukernavn</th>
                <th>Navn</th>
                <th>E-post</th>
                <th>Telefon</th>
                <th>Grupper</th>
              </tr>
            </thead>
            <tbody>
              {section.users.map((user) => (
                <tr key={user.username}>
                  <td>
                    <UserLink username={user.username} />
                  </td>
                  <td>{user.realname}</td>
                  <td>{user.email ?? ""}</td>
                  <td>{user.phone ?? ""}</td>
                  <td>
                    {!user.groups || user.groups.length === 0 ? (
                      <i className="text-muted">Ingen grupper</i>
                    ) : (
                      <CommaSeparated>
                        {user.groups.map((group) => (
                          <GroupLink key={group} groupName={group} />
                        ))}
                      </CommaSeparated>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </>
  )
}
