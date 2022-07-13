import { Loading } from "components/Loading"
import { PageTitle } from "modules/core/title/PageTitle"
import React from "react"

export const LoadingPage = ({ title = "Laster..." }: { title?: string }) => (
  <>
    <PageTitle title={title} />
    <Loading />
  </>
)
