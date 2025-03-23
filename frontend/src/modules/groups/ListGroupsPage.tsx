import { ErrorMessages } from "components/ErrorMessages.js"
import { Loading } from "components/Loading.js"
import { useTitle } from "modules/core/title/PageTitle.js"
import { useGroupList } from "modules/groups/api.js"
import { GroupLink } from "./GroupLink.js"

export const ListGroupsPage = () => {
  useTitle("Grupper")

  const { isPending, isError, error, data } = useGroupList()

  if (isPending) {
    return <Loading />
  }

  if (isError && data == null) {
    return <ErrorMessages error={error} />
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
