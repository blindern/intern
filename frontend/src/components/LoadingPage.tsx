import { Loading } from "components/Loading.js"
import { PageTitle } from "modules/core/title/PageTitle.js"

export const LoadingPage = ({ title = "Laster..." }: { title?: string }) => (
  <>
    <PageTitle title={title} />
    <Loading />
  </>
)
