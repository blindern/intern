import { useGoogleAppsCreateAccountMutation } from "./hooks.js"
import { useForm } from "react-hook-form"

export function NewAccount() {
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
