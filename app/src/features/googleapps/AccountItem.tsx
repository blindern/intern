import { Link } from "@tanstack/react-router"
import {
  type Account,
  useGoogleAppsUpdateAccountMutation,
  useGoogleAppsUpdateAccountUserMutation,
  useGoogleAppsDeleteAccountUserMutation,
  useGoogleAppsDeleteAccountMutation,
} from "./hooks.js"
import { NewAccountUser } from "./NewAccountUser.js"
import { AddAlias } from "./AddAlias.js"
import { EditAccount } from "./EditAccount.js"

import { Fragment, useState } from "react"

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

  function deleteAlias(alias: string) {
    mutateAccount({
      id: account.id,
      accountname: account.accountname,
      group: account.group ?? "",
      aliases: aliases.filter((it) => it !== alias),
    })
  }

  return (
    <>
      <h4>
        {account.accountname}
        {!isEdit && aliases.length > 0 && (
          <>
            {" "}
            <span style={{ fontSize: "80%" }}>
              {aliases.map((alias, idx) => (
                <Fragment key={alias}>
                  {idx > 0 && ", "}
                  {alias}
                </Fragment>
              ))}
            </span>
          </>
        )}
        {globalEdit && (
          <span style={{ float: "right" }}>
            <button type="button" onClick={() => setIsEdit(!isEdit)}>
              rediger
            </button>
            <button
              type="button"
              onClick={() => mutateDeleteAccount({ id: account.id })}
            >
              slett
            </button>
            <button type="button" onClick={() => setIsNewUser(!isNewUser)}>
              ny tilgang
            </button>
          </span>
        )}
      </h4>

      {users.length === 0 && <p>Ingen har tilgang til denne kontoen.</p>}

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <span style={{ display: "inline-block", minWidth: "220px" }}>
              <Link to="/user/$name" params={{ name: user.username }}>
                {user.realname ?? user.username}
              </Link>
            </span>
            <span style={{ display: "inline-block", minWidth: "120px" }}>
              {user.notification && <>(mottar varsler)</>}
            </span>
            {globalEdit && (
              <>
                <button type="button" onClick={() => mutateDeleteUser(user)}>
                  slett tilgang
                </button>{" "}
                /{" "}
                <button
                  type="button"
                  onClick={() =>
                    mutateUser({ ...user, notification: !user.notification })
                  }
                >
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
                {alias}{" "}
                <button type="button" onClick={() => deleteAlias(alias)}>
                  slett
                </button>
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
