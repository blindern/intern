import { Loading } from "components/Loading.js"
import { PageTitle } from "modules/core/title/PageTitle.js"
import React from "react"

export const LoadingPage = ({ title = "Laster..." }: { title?: string }) => (
  <>
    <PageTitle title={title} />
    <Loading />
  </>
)
