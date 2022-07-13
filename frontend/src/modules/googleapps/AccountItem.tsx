import { AddAlias } from "modules/googleapps/AddAlias"
import {
  Account,
  AccountUser,
  useGoogleAppsDeleteAccountMutation,
  useGoogleAppsDeleteAccountUserMutation,
  useGoogleAppsUpdateAccountMutation,
  useGoogleAppsUpdateAccountUserMutation,
} from "modules/googleapps/api"
import { EditAccount } from "modules/googleapps/EditAccount"
import { NewAccountUser } from "modules/googleapps/NewAccountUser"
import React, { useState } from "react"
import { Link } from "react-router-dom"
import { userUrl } from "urls"

export function AccountItem({
  account,
  globalEdit,
}: {
  account: Account
  globalEdit: boolean
}) {
  const [isEdit, setIsEdit] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)

  const { mutate: mutateAccount } = useGoogleAppsUpdateAccountMutation()
  const { mutate: mutateUser } = useGoogleAppsUpdateAccountUserMutation()
  const { mutate: mutateDeleteUser } = useGoogleAppsDeleteAccountUserMutation()
  const { mutate: mutateDeleteAccount } = useGoogleAppsDeleteAccountMutation()

  const users = account.users ?? []
  const aliases = account.aliases ?? []

  function deleteAccount() {
    mutateDeleteAccount(account)
  }

  function deleteUser(user: AccountUser) {
    mutateDeleteUser(user)
  }

  function changeNotification(user: AccountUser) {
    mutateUser({
      ...user,
      notification: !user.notification,
    })
  }

  function deleteAlias(alias: string) {
    mutateAccount({
      ...account,
      aliases: aliases.filter((it) => it !== alias),
    })
  }

  return (
    <>
      <h4>
        {account.accountname}
        {!isEdit && account.aliases && account.aliases.length > 0 && (
          <>
            {" "}
            <span style={{ fontSize: "80%" }}>
              {account.aliases.map((alias, idx) => (
                <>
                  {idx > 0 && ", "}
                  {alias}
                </>
              ))}
            </span>
          </>
        )}

        {globalEdit && (
          <span style={{ float: "right" }}>
            <button onClick={() => setIsEdit(!isEdit)}>rediger</button>
            <button onClick={() => deleteAccount()}>slett</button>
            <button onClick={() => setIsNewUser(!isNewUser)}>ny tilgang</button>
          </span>
        )}
      </h4>

      {users.length == 0 && <p>Ingen har tilgang til denne kontoen.</p>}

      <ul>
        {users.map((user) => (
          <li key={user._id}>
            <span style={{ display: "inline-block", minWidth: "220px" }}>
              <Link to={userUrl(user.username)}>
                {user.realname ?? user.username}
              </Link>
            </span>
            <span style={{ display: "inline-block", minWidth: "120px" }}>
              {user.notification && <>(mottar varsler)</>}
            </span>
            {globalEdit && (
              <>
                <button onClick={() => deleteUser(user)}>slett tilgang</button>{" "}
                /{" "}
                <button onClick={() => changeNotification(user)}>
                  endre varsel
                </button>
              </>
            )}
          </li>
        ))}
        {isNewUser && (
          <li>
            <NewAccountUser account={account} />
          </li>
        )}
      </ul>

      {isEdit && (
        <>
          <p>Aliases:</p>
          <ul>
            {aliases.map((alias) => (
              <li key={alias}>
                {alias}
                <button onClick={() => deleteAlias(alias)}>slett</button>
              </li>
            ))}
            <li>
              <AddAlias account={account} />
            </li>
          </ul>

          <EditAccount
            account={account}
            editComplete={() => setIsEdit(false)}
          />
        </>
      )}
    </>
  )
}
