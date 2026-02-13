import { ErrorMessages } from "components/ErrorMessages.js"
import { Loading } from "components/Loading.js"
import { Group } from "modules/core/auth/types.js"
import { useTitle } from "modules/core/title/PageTitle.js"
import { useGroupList } from "modules/groups/api.js"
import { useState } from "react"
import {
  RegistrationRequest,
  useApproveRegistrationMutation,
  useRegistrationRequests,
  useRejectRegistrationMutation,
} from "./registrationApi.js"

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

  function toggleGroup(id: string) {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    )
  }

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
            onChange={() => toggleGroup(g.unique_id)}
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

  function handleReject() {
    const msg = `Er du sikker på at du vil avvise ${request.username}?`
    if (!window.confirm(msg)) return
    reject(request.id)
  }

  return (
    <button
      className="btn btn-danger btn-xs"
      disabled={isPending}
      onClick={handleReject}
    >
      {isPending ? "Avviser..." : "Avvis"}
    </button>
  )
}

function RequestsTable({
  requests,
  groups,
  showActions,
}: {
  requests: RegistrationRequest[]
  groups: Group[]
  showActions: boolean
}) {
  if (requests.length === 0) {
    return <p className="text-muted">Ingen forespørsler.</p>
  }

  return (
    <table className="table table-striped table-hover table-condensed">
      <thead>
        <tr>
          <th>Brukernavn</th>
          <th>Navn</th>
          <th>E-post</th>
          <th>Mobil</th>
          <th>Dato</th>
          {!showActions && <th>Status</th>}
          {showActions && <th>Handlinger</th>}
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
            <td>{new Date(req.created_at).toLocaleString("nb-NO")}</td>
            {!showActions && (
              <td>
                {req.status === "approved" && (
                  <span className="label label-success">
                    Godkjent ({req.group_name}) av {req.processed_by}{" "}
                    {req.processed_at &&
                      new Date(req.processed_at).toLocaleString("nb-NO")}
                  </span>
                )}
                {req.status === "rejected" && (
                  <span className="label label-danger">
                    Avvist av {req.processed_by}{" "}
                    {req.processed_at &&
                      new Date(req.processed_at).toLocaleString("nb-NO")}
                  </span>
                )}
              </td>
            )}
            {showActions && (
              <td>
                <ApproveButton request={req} groups={groups} />{" "}
                <RejectButton request={req} />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export const RegistrationRequestsPage = () => {
  useTitle("Registreringsforespørsler")

  const [tab, setTab] = useState<"pending" | "all">("pending")
  const pendingQuery = useRegistrationRequests("pending")
  const allQuery = useRegistrationRequests("all", tab === "all")
  const groupsQuery = useGroupList()

  const query = tab === "pending" ? pendingQuery : allQuery

  if (query.isPending || groupsQuery.isPending) {
    return <Loading />
  }

  if (query.isError) {
    return <ErrorMessages error={query.error} />
  }

  if (groupsQuery.isError) {
    return <ErrorMessages error={groupsQuery.error} />
  }

  const groups = groupsQuery.data ?? []

  return (
    <>
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

      <RequestsTable
        requests={query.data ?? []}
        groups={groups}
        showActions={tab === "pending"}
      />

      <p className="text-muted" style={{ marginTop: 20 }}>
        Ved godkjenning sendes det en e-post til brukeren. Ved avvisning sendes
        det ingen varsling. Denne siden er kun tilgjengelig for medlemmer av
        gruppen <em>useradmin</em>.
      </p>
    </>
  )
}
