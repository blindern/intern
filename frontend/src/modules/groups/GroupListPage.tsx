import { useApiFetcher } from 'api'
import LoadingPage from 'components/LoadingPage'
import { Group } from 'modules/core/auth/types'
import { PageTitle } from 'modules/core/title/PageTitle'
import React from 'react'
import GroupLink from './GroupLink'
import { groupsService } from './GroupsService'

const List = ({ groupList }: { groupList: Group[] }) => (
  <>
    <PageTitle title='Grupper' />
    <table
      className='table table-striped nowrap table-condensed'
      style={{ width: 'auto' }}
    >
      <thead>
        <tr>
          <th>Gruppe</th>
          <th>Beskrivelse</th>
        </tr>
      </thead>
      <tbody>
        {groupList.map(group => (
          <tr key={group.name}>
            <td>
              <GroupLink groupName={group.name} />
            </td>
            <td>{group.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
)

const GroupListPage = () => {
  const groupList = useApiFetcher(groupsService.getGroupList, [])
  if (!groupList) {
    return <LoadingPage />
  }

  return <List groupList={groupList} />
}

export default GroupListPage
