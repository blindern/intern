import { CommaSeparated } from "components/CommaSeparated.js"
import { ErrorMessages } from "components/ErrorMessages.js"
import { Loading } from "components/Loading.js"
import { UserDetails } from "modules/core/auth/types.js"
import { useTitle } from "modules/core/title/PageTitle.js"
import { GroupLink } from "modules/groups/GroupLink.js"
import { useUserList } from "modules/users/api.js"
import React from "react"
import { styled } from "styled-components"
import { UserLink } from "./UserLink.js"

interface UserSections {
  beboere: UserDetails[]
  others: UserDetails[]
  utflyttede: UserDetails[]
}

const realnameFallback = (user: UserDetails) => user.realname ?? user.username

const compareByRealname = (a: UserDetails, b: UserDetails) =>
  realnameFallback(a).localeCompare(realnameFallback(b))

const groupAndSortBySections = (userList: UserDetails[]) => {
  const result = userList.reduce<UserSections>(
    (acc, user) => {
      if (user.groups.includes("beboer")) {
        acc.beboere.push(user)
      } else if (user.groups.includes("utflyttet")) {
        acc.utflyttede.push(user)
      } else {
        acc.others.push(user)
      }
      return acc
    },
    {
      beboere: [],
      others: [],
      utflyttede: [],
    },
  )

  result.beboere.sort(compareByRealname)
  result.others.sort(compareByRealname)
  result.utflyttede.sort(compareByRealname)

  return result
}

const UserListSection = styled.div`
  td:nth-child(1),
  td:nth-child(2) {
    white-space: nowrap;
  }
`

export const ListUsersPage = () => {
  useTitle("Brukerliste")

  const { isPending, isError, error, data: userList } = useUserList()

  if (isPending) {
    return <Loading />
  }

  if (isError && userList == null) {
    return <ErrorMessages error={error} />
  }

  const grouped = groupAndSortBySections(userList)
  const sections = [
    {
      title: "Beboere",
      users: grouped.beboere,
    },
    {
      title: "Andre brukere",
      users: grouped.others,
    },
    {
      title: "Utflyttede",
      users: grouped.utflyttede,
    },
  ]

  return (
    <>
      <p>
        Denne brukerlisten kan ses av alle innloggede brukere. Totalt eksisterer
        det {userList.length} brukere i systemet.
      </p>

      {sections.map((section, idx) => (
        <UserListSection key={idx} className="panel panel-info">
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
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>
                    {user.groups.length === 0 ? (
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
        </UserListSection>
      ))}
    </>
  )
}
