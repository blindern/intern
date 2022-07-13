import {
  Account,
  useGoogleAppsUpdateAccountMutation,
} from "modules/googleapps/api"
import React from "react"
import { useForm } from "react-hook-form"

interface EditAccountForm {
  accountname: string
  group: string
}

export function EditAccount({
  account,
  editComplete,
}: {
  account: Account
  editComplete(): void
}) {
  const { mutateAsync } = useGoogleAppsUpdateAccountMutation()
  const { handleSubmit, register } = useForm<EditAccountForm>({
    defaultValues: {
      accountname: account.accountname,
      group: account.group,
    },
  })

  async function onSubmit(values: EditAccountForm) {
    if (values.accountname != "" && values.group != "") {
      await mutateAsync({
        ...account,
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
