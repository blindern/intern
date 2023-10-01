import { useGoogleAppsCreateAccountMutation } from "modules/googleapps/api.js"
import React from "react"
import { useForm } from "react-hook-form"

interface NewAccountForm {
  accountname: string
  group: string
}

export function NewAccount() {
  const { mutateAsync } = useGoogleAppsCreateAccountMutation()
  const { handleSubmit, register, reset } = useForm<NewAccountForm>()

  async function onSubmit(values: NewAccountForm) {
    if (values.accountname != "" && values.group != "") {
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
