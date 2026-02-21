import { createFileRoute } from "@tanstack/react-router"
import { ErrorMessages } from "../../components/ErrorMessages.js"
import { Loading } from "../../components/Loading.js"
import { PageTitle } from "../../hooks/useTitle.js"
import { useGroupList } from "../../features/users/hooks.js"
import {
  useRegistrationRequests,
  useApproveRegistrationMutation,
  useRejectRegistrationMutation,
} from "../../features/registration/hooks.js"
import { useState } from "react"

export const Route = createFileRoute("/users/registrations")({
  component: RegistrationRequestsPage,
})

type RegistrationRequest = NonNullable<
  Awaited<ReturnType<typeof useRegistrationRequests>>["data"]
>[number]
type Group = NonNullable<
  Awaited<ReturnType<typeof useGroupList>>["data"]
>[number]

function ApproveButton({
  request,
  groups,
}: {
  request: RegistrationRequest
  groups: Group[]
}) {
  const defaultGroups = groups
    .filter((g) => g.unique_id === "beboer")
    .map((g) => g.unique_id)
  const [selectedGroups, setSelectedGroups] = useState<string[]>(defaultGroups)
  const [showSelect, setShowSelect] = useState(false)
  const { isPending, mutate: approve } = useApproveRegistrationMutation()

  if (!showSelect) {
    return (
      <button
        className="btn btn-success btn-xs"
        onClick={() => setShowSelect(true)}
      >
        Godkjenn
      </button>
    )
  }

  return (
    <span>
      {groups.map((g) => (
        <label
          key={g.unique_id}
          style={{ marginRight: 8, fontWeight: "normal" }}
        >
          <input
            type="checkbox"
            checked={selectedGroups.includes(g.unique_id)}
            onChange={() =>
              setSelectedGroups((prev) =>
                prev.includes(g.unique_id)
                  ? prev.filter((x) => x !== g.unique_id)
                  : [...prev, g.unique_id],
              )
            }
          />{" "}
          {g.unique_id}
        </label>
      ))}{" "}
      <button
        className="btn btn-success btn-xs"
        disabled={isPending || selectedGroups.length === 0}
        onClick={() => approve({ id: request.id, groups: selectedGroups })}
      >
        {isPending ? "Godkjenner..." : "Bekreft"}
      </button>{" "}
      <button
        className="btn btn-default btn-xs"
        onClick={() => setShowSelect(false)}
      >
        Avbryt
      </button>
    </span>
  )
}

function RejectButton({ request }: { request: RegistrationRequest }) {
  const { isPending, mutate: reject } = useRejectRegistrationMutation()
  return (
    <button
      className="btn btn-danger btn-xs"
      disabled={isPending}
      onClick={() => {
        if (
          window.confirm(
            `Er du sikker på at du vil avvise ${request.username}?`,
          )
        )
          reject(request.id)
      }}
    >
      {isPending ? "Avviser..." : "Avvis"}
    </button>
  )
}

function RegistrationRequestsPage() {
  const [tab, setTab] = useState<"pending" | "all">("pending")
  const pendingQuery = useRegistrationRequests("pending")
  const allQuery = useRegistrationRequests("all", tab === "all")
  const groupsQuery = useGroupList()

  const query = tab === "pending" ? pendingQuery : allQuery
  if (query.isPending || groupsQuery.isPending)
    return (
      <>
        <PageTitle title="Registreringsforespørsler" />
        <Loading />
      </>
    )
  if (query.isError)
    return (
      <>
        <PageTitle title="Registreringsforespørsler" />
        <ErrorMessages error={query.error} />
      </>
    )
  if (groupsQuery.isError)
    return (
      <>
        <PageTitle title="Registreringsforespørsler" />
        <ErrorMessages error={groupsQuery.error} />
      </>
    )

  const groups = groupsQuery.data ?? []
  const requests = query.data ?? []

  return (
    <>
      <PageTitle title="Registreringsforespørsler" />
      <ul className="nav nav-tabs" style={{ marginBottom: 15 }}>
        <li className={tab === "pending" ? "active" : ""}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setTab("pending")
            }}
          >
            Ventende{" "}
            {pendingQuery.data && (
              <span className="badge">{pendingQuery.data.length}</span>
            )}
          </a>
        </li>
        <li className={tab === "all" ? "active" : ""}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setTab("all")
            }}
          >
            Alle
          </a>
        </li>
      </ul>

      {requests.length === 0 ? (
        <p className="text-muted">Ingen forespørsler.</p>
      ) : (
        <table className="table table-striped table-hover table-condensed">
          <thead>
            <tr>
              <th>Brukernavn</th>
              <th>Navn</th>
              <th>E-post</th>
              <th>Mobil</th>
              <th>Dato</th>
              {tab === "pending" ? <th>Handlinger</th> : <th>Status</th>}
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>{req.username}</td>
                <td>
                  {req.firstname} {req.lastname}
                </td>
                <td>{req.email}</td>
                <td>{req.phone ?? "-"}</td>
                <td>{new Date(req.createdAt).toLocaleString("nb-NO")}</td>
                {tab === "pending" ? (
                  <td>
                    <ApproveButton request={req} groups={groups} />{" "}
                    <RejectButton request={req} />
                  </td>
                ) : (
                  <td>
                    {req.status === "approved" && (
                      <span className="label label-success">
                        Godkjent ({req.groupName}) av {req.processedBy}{" "}
                        {req.processedAt &&
                          new Date(req.processedAt).toLocaleString("nb-NO")}
                      </span>
                    )}
                    {req.status === "rejected" && (
                      <span className="label label-danger">
                        Avvist av {req.processedBy}{" "}
                        {req.processedAt &&
                          new Date(req.processedAt).toLocaleString("nb-NO")}
                      </span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="text-muted" style={{ marginTop: 20 }}>
        Ved godkjenning sendes det en e-post til brukeren. Ved avvisning sendes
        det ingen varsling. Denne siden er kun tilgjengelig for medlemmer av
        gruppen <em>useradmin</em>.
      </p>
    </>
  )
}
