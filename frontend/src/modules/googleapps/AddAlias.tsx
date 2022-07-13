import {
  Account,
  useGoogleAppsUpdateAccountMutation,
} from "modules/googleapps/api"
import React from "react"
import { useForm } from "react-hook-form"

interface AddAliasForm {
  alias: string
}

export function AddAlias({ account }: { account: Account }) {
  const { mutateAsync } = useGoogleAppsUpdateAccountMutation()
  const { handleSubmit, register, reset } = useForm<AddAliasForm>({
    defaultValues: {
      alias: "",
    },
  })

  async function onSubmit(values: AddAliasForm) {
    const aliases = account.aliases ?? []
    if (values.alias != "" && !aliases.includes(values.alias)) {
      await mutateAsync({
        ...account,
        aliases: [...(account.aliases ?? []), values.alias],
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
