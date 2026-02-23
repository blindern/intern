import { ErrorMessages } from "../../components/ErrorMessages.js"
import { Loading } from "../../components/Loading.js"
import { useGoogleAppsAccounts } from "./hooks.js"
import { useIsMemberOf } from "../auth/hooks.js"
import { PageTitle } from "../../hooks/useTitle.js"
import { AccountItem } from "./AccountItem.js"
import { NewAccount } from "./NewAccount.js"
import { Fragment, useState } from "react"

export function GoogleAppsPage() {
  const canEdit = useIsMemberOf(["ukestyret"])
  const { isPending, isError, error, data: accounts } = useGoogleAppsAccounts()
  const [isEditing, setEditing] = useState(false)

  const accountgroups: Record<string, NonNullable<typeof accounts>> = {}
  for (const account of accounts ?? []) {
    const key = account.group ?? ""
    ;(accountgroups[key] ??= []).push(account)
  }

  return (
    <>
      <PageTitle title="Google Apps" />
      <p>
        Viser de ulike Google Apps-kontoene med hvilke foreningsbrukere som har
        tilgang. UKEstyret og administratorer kan redigere listen.
      </p>

      {isPending ? (
        <Loading />
      ) : isError && !accounts ? (
        <ErrorMessages error={error} />
      ) : (
        <>
          {canEdit && (
            <p>
              <button type="button" onClick={() => setEditing(!isEditing)}>
                Rediger
              </button>
            </p>
          )}
          {accounts?.length === 0 && <p>Ingen oppføringer lagret</p>}
          {isEditing && (
            <>
              <h2>Ny konto</h2>
              <NewAccount />
            </>
          )}
        </>
      )}

      {Object.entries(accountgroups).map(([group, groupaccounts]) => (
        <Fragment key={group}>
          <h2>{group}</h2>
          {groupaccounts?.map((account) => (
            <AccountItem
              key={account.id}
              account={account}
              globalEdit={isEditing}
            />
          ))}
        </Fragment>
      ))}
    </>
  )
}
