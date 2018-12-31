import { useApiFetcher } from 'api'
import CommaSeparated from 'components/CommaSeparated'
import LoadingPage from 'components/LoadingPage'
import { UserDetails } from 'modules/core/auth/types'
import { AuthContext } from 'modules/core/auth/UserProvider'
import { PageTitle } from 'modules/core/title/PageTitle'
import GroupLink from 'modules/groups/GroupLink'
import React, { useContext } from 'react'
import UserLink from './UserLink'
import { usersService } from './UsersService'

interface UserSections {
  beboere: UserDetails[]
  others: UserDetails[]
  utflyttede: UserDetails[]
}

const realnameFallback = (user: UserDetails) =>
  user.realname == null ? user.username : user.realname

const compareByRealname = (a: UserDetails, b: UserDetails) =>
  realnameFallback(a).localeCompare(realnameFallback(b))

const groupAndSortBySections = (userList: UserDetails[]) => {
  const result = userList.reduce<UserSections>(
    (acc, user) => {
      if (user.groups.includes('beboer')) {
        acc.beboere.push(user)
      } else if (user.groups.includes('utflyttet')) {
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

const List = ({ userList }: { userList: UserDetails[] }) => {
  const { isLoggedIn } = useContext(AuthContext)

  const grouped = groupAndSortBySections(userList)
  const sections = [
    {
      title: 'Beboere',
      users: grouped.beboere,
    },
    {
      title: 'Andre brukere',
      users: grouped.others,
    },
    {
      title: 'Utflyttede',
      users: grouped.utflyttede,
    },
  ]

  const hideEmail = !isLoggedIn

  return (
    <>
      <PageTitle title='Brukerliste' />
      <p>
        Denne brukerlisten kan ses av alle innloggede brukere. Totalt eksisterer
        det {userList.length} brukere i systemet.
      </p>

      {sections.map((section, idx) => (
        <div key={idx} className='panel panel-info userlist'>
          <div className='panel-heading'>
            {section.title} ({section.users.length} stk)
          </div>
          <table className='table table-striped table-hover table-condensed'>
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
              {section.users.map(user => (
                <tr key={user.username}>
                  <td>
                    <UserLink username={user.username} />
                  </td>
                  <td>{user.realname}</td>
                  {hideEmail ? (
                    <td>
                      <i>Skjult</i>
                    </td>
                  ) : (
                    <td>{user.email}</td>
                  )}
                  <td>{user.phone}</td>
                  <td>
                    {user.groups.length === 0 ? (
                      <i className='text-muted'>Ingen grupper</i>
                    ) : (
                      <CommaSeparated>
                        {user.groups.map(group => (
                          <GroupLink groupName={group} />
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

const UserListPage = () => {
  const userList = useApiFetcher(usersService.getUserList)
  if (!userList) {
    return <LoadingPage />
  }

  return <List userList={userList} />
}

export default UserListPage
