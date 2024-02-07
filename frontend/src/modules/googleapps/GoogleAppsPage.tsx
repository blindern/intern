import { ErrorMessages } from "components/ErrorMessages.js"
import { Loading } from "components/Loading.js"
import { groupBy } from "lodash"
import { useIsMemberOf } from "modules/core/auth/hooks.js"
import { useTitle } from "modules/core/title/PageTitle.js"
import { AccountItem } from "modules/googleapps/AccountItem.js"
import { useGoogleAppsAccounts } from "modules/googleapps/api.js"
import { NewAccount } from "modules/googleapps/NewAccount.js"
import React, { useState } from "react"

export function GoogleAppsPage() {
  useTitle("Google Apps")

  const canEdit = useIsMemberOf(["ukestyret"])

  const { isPending, isError, error, data: accounts } = useGoogleAppsAccounts()

  const [isEditing, setEditing] = useState(false)

  const accountgroups = groupBy(accounts, (it) => it.group)

  return (
    <>
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
              <button onClick={() => setEditing(!isEditing)}>Rediger</button>
            </p>
          )}

          {accounts !== undefined && accounts.length === 0 && (
            <p>Ingen oppføringer lagret</p>
          )}

          {isEditing && (
            <>
              <h2>Ny konto</h2>
              <NewAccount />
            </>
          )}
        </>
      )}

      {Object.entries(accountgroups).map(([group, groupaccounts]) => (
        <React.Fragment key={group}>
          <h2>{group}</h2>
          {groupaccounts.map((account) => (
            <AccountItem
              key={account._id}
              account={account}
              globalEdit={isEditing}
            />
          ))}
        </React.Fragment>
      ))}
    </>
  )
}
