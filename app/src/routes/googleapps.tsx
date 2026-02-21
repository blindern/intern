import { createFileRoute, Link } from "@tanstack/react-router"
import { ErrorMessages } from "../components/ErrorMessages.js"
import { Loading } from "../components/Loading.js"
import {
  type Account,
  useGoogleAppsAccounts,
  useGoogleAppsCreateAccountMutation,
  useGoogleAppsCreateAccountUserMutation,
  useGoogleAppsDeleteAccountMutation,
  useGoogleAppsDeleteAccountUserMutation,
  useGoogleAppsUpdateAccountMutation,
  useGoogleAppsUpdateAccountUserMutation,
} from "../features/googleapps/hooks.js"
import { useIsMemberOf } from "../features/auth/hooks.js"
import { PageTitle } from "../hooks/useTitle.js"
import { userUrl } from "../utils/urls.js"
import { groupBy } from "lodash"
import { Fragment, useState } from "react"
import { useForm } from "react-hook-form"

export const Route = createFileRoute("/googleapps")({
  component: GoogleAppsPage,
})

function NewAccount() {
  const { mutateAsync } = useGoogleAppsCreateAccountMutation()
  const { handleSubmit, register, reset } = useForm<{
    accountname: string
    group: string
  }>()

  async function onSubmit(values: { accountname: string; group: string }) {
    if (values.accountname !== "" && values.group !== "") {
      await mutateAsync({
        accountname: values.accountname.trim(),
        group: values.group.trim(),
      })
      reset()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-inline">
      <p>
        <input
          {...register("accountname")}
          className="form-control"
          type="text"
          placeholder="Google-konto"
        />
        <input
          {...register("group")}
          className="form-control"
          type="text"
          placeholder="Gruppe"
        />
        <input className="btn btn-primary" type="submit" value="Opprett" />
      </p>
    </form>
  )
}

function EditAccount({
  account,
  editComplete,
}: {
  account: Account
  editComplete: () => void
}) {
  const { mutateAsync } = useGoogleAppsUpdateAccountMutation()
  const { handleSubmit, register } = useForm({
    defaultValues: {
      accountname: account.accountname,
      group: account.group ?? "",
    },
  })

  async function onSubmit(values: { accountname: string; group: string }) {
    if (values.accountname !== "" && values.group !== "") {
      await mutateAsync({
        id: account.id,
        aliases: account.aliases ?? [],
        accountname: values.accountname.trim(),
        group: values.group.trim(),
      })
      editComplete()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-inline">
      Kontonavn:{" "}
      <input
        {...register("accountname")}
        type="text"
        className="form-control"
      />{" "}
      Gruppe/kategori:{" "}
      <input {...register("group")} type="text" className="form-control" />{" "}
      <input className="btn" type="submit" value="Oppdater" />
    </form>
  )
}

function AddAlias({ account }: { account: Account }) {
  const { mutateAsync } = useGoogleAppsUpdateAccountMutation()
  const { handleSubmit, register, reset } = useForm({
    defaultValues: { alias: "" },
  })

  async function onSubmit(values: { alias: string }) {
    const aliases = account.aliases ?? []
    if (values.alias !== "" && !aliases.includes(values.alias)) {
      await mutateAsync({
        id: account.id,
        accountname: account.accountname,
        group: account.group ?? "",
        aliases: [...aliases, values.alias],
      })
      reset()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-inline">
      <input
        {...register("alias")}
        type="text"
        className="form-control"
        placeholder="Alias"
      />{" "}
      <input className="btn" type="submit" value="Legg til" />
    </form>
  )
}

function NewAccountUser({ account }: { account: Account }) {
  const { mutateAsync } = useGoogleAppsCreateAccountUserMutation()
  const { handleSubmit, register, reset } = useForm<{
    username: string
    notification: boolean
  }>()

  async function onSubmit(values: { username: string; notification: boolean }) {
    const username = values.username.trim()
    if (username !== "") {
      await mutateAsync({
        accountname: account.accountname,
        username,
        notification: values.notification,
      })
      reset()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-inline">
      <input
        {...register("username")}
        className="form-control"
        type="text"
        placeholder="Foreningsbruker"
      />
      <div className="checkbox">
        <label>
          <input {...register("notification")} type="checkbox" /> Varsle om
          e-poster
        </label>
      </div>
      <input className="btn" type="submit" value="Gi tilgang" />
    </form>
  )
}

function AccountItem({
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
              <Link to={userUrl(user.username)}>
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

function GoogleAppsPage() {
  const canEdit = useIsMemberOf(["ukestyret"])
  const { isPending, isError, error, data: accounts } = useGoogleAppsAccounts()
  const [isEditing, setEditing] = useState(false)

  const accountgroups = groupBy(accounts, (it) => it.group)

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
          {groupaccounts.map((account) => (
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
