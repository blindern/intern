import { type Account, useGoogleAppsUpdateAccountMutation } from "./hooks.js"
import { useForm } from "react-hook-form"

export function EditAccount({
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
