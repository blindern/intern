import {
  type Account,
  useGoogleAppsCreateAccountUserMutation,
} from "./hooks.js"
import { useForm } from "react-hook-form"

export function NewAccountUser({ account }: { account: Account }) {
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
