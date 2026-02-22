import { type Account, useGoogleAppsUpdateAccountMutation } from "./hooks.js"
import { useForm } from "react-hook-form"

export function AddAlias({ account }: { account: Account }) {
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
