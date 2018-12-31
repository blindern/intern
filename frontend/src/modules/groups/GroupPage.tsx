import { useApiFetcher } from 'api'
import LoadingPage from 'components/LoadingPage'
import { PageTitle } from 'modules/core/title/PageTitle'
import UserLink from 'modules/users/UserLink'
import { IndirectMemberInfo } from 'modules/users/UserPage'
import React from 'react'
import GroupLink from './GroupLink'
import { GroupDetail, groupsService } from './GroupsService'

const Detail = ({ group }: { group: GroupDetail }) => (
  <>
    <PageTitle title={`Gruppe: ${group.name}`} />

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
        className='table table-striped table-condensed'
        style={{ width: 'auto' }}
      >
        <thead>
          <tr>
            <th>Bruker</th>
            <th>Navn</th>
          </tr>
        </thead>
        <tbody>
          {group.members.map(member => (
            <tr
              key={member.username}
              style={{
                opacity: !member.group_relations[group.name].includes(
                  group.name,
                )
                  ? 0.5
                  : 1,
              }}
            >
              <td>
                <UserLink username={member.username} />
              </td>
              <td>
                {member.realname}
                <IndirectMemberInfo user={member} group={group} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}

    {group.members.length === 0 && <p>Ingen medlemmer i gruppa</p>}

    {group.members_real.groups.length > 0 && (
      <>
        <h3>Grupper som er medlemmer</h3>
        <p>Medlemmer i disse gruppene er også medlemmer av denne gruppa.</p>
        <ul>
          {group.members_real.groups.map(group => (
            <li key={group}>
              <GroupLink groupName={group} />
            </li>
          ))}
        </ul>
      </>
    )}

    <h2>Administratorer</h2>
    {group.owners.groups.length === 0 && group.owners.users.length === 0 ? (
      <p>Ingen administratorer er satt.</p>
    ) : (
      <>
        <ul>
          {group.owners.groups.map(groupName => (
            <li key={groupName}>
              <GroupLink groupName={groupName} />
            </li>
          ))}
          {group.owners.users.map(username => (
            <li key={username}>
              <UserLink username={username} />
            </li>
          ))}
        </ul>
      </>
    )}
  </>
)

interface GroupPageProps {
  match: {
    params: {
      name: string
    }
  }
}

const GroupPage = ({
  match: {
    params: { name },
  },
}: GroupPageProps) => {
  const group = useApiFetcher(() => groupsService.getGroup(name), [name])
  if (!group) {
    return <LoadingPage />
  }

  return <Detail group={group} />
}

export default GroupPage
