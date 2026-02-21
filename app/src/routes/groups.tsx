import { createFileRoute } from "@tanstack/react-router"
import { ErrorMessages } from "../components/ErrorMessages.js"
import { Loading } from "../components/Loading.js"
import { GroupLink } from "../components/GroupLink.js"
import { useGroupList } from "../features/users/hooks-groups.js"
import { PageTitle } from "../hooks/useTitle.js"

export const Route = createFileRoute("/groups")({
  component: ListGroupsPage,
})

function ListGroupsPage() {
  const { isPending, isError, error, data } = useGroupList()

  if (isPending)
    return (
      <>
        <PageTitle title="Grupper" />
        <Loading />
      </>
    )
  if (isError && data == null)
    return (
      <>
        <PageTitle title="Grupper" />
        <ErrorMessages error={error} />
      </>
    )

  return (
    <>
      <PageTitle title="Grupper" />
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
            <tr key={group.unique_id}>
              <td>
                <GroupLink groupName={group.name ?? group.unique_id} />
              </td>
              <td>{group.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
