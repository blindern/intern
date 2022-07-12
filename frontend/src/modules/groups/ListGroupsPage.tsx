import { useTitle } from "modules/core/title/PageTitle"
import { useGroupList } from "modules/groups/api"
import React from "react"
import { GroupLink } from "./GroupLink"

export const ListGroupsPage = () => {
  useTitle("Grupper")

  const { isFetching, isSuccess, data } = useGroupList()

  if (isFetching) {
    return <p>Laster grupper...</p>
  }

  if (!isSuccess) {
    return <p>Noe gikk galt</p>
  }

  return (
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
        {data.map((group) => (
          <tr key={group.name}>
            <td>
              <GroupLink groupName={group.name} />
            </td>
            <td>{group.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
