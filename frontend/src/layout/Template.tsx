import classNames from "classnames"
import { LoginLink } from "components/LoginLink.js"
import { LogoutLink } from "components/LogoutLink.js"
import { useAuthInfo } from "modules/core/auth/AuthInfoProvider.js"
import { Flashes } from "modules/core/flashes/Flashes.js"
import { useCurrentTitle } from "modules/core/title/TitleProvider.js"
import { ReactNode } from "react"
import { Link, useMatch } from "react-router-dom"
import { styled } from "styled-components"
import {
  arrplanUrl,
  dugnadsinnkallingerUrl,
  lastPrintsUrl,
  listBooksUrl,
  listGroupsUrl,
  listUsersUrl,
  printerInvocingUrl,
  registerUserUrl,
} from "utils/urls.js"
import "./frontend.scss"

const MenuLink = ({ children, to }: { children: ReactNode; to: string }) => {
  const isActive = useMatch(to + "/*") != null

  return (
    <li className={classNames({ active: isActive })}>
      <Link to={to}>{children}</Link>
    </li>
  )
}

// Wrapper for page content to push down footer
const Wrap = styled.div`
  min-height: 100%;
  height: auto !important;
  height: 100%;
  /* Negative indent footer by its height */
  margin: 0 auto -60px;
  /* Pad bottom by footer height */
  padding: 0 0 60px;
`

const WrapContainer = styled.div`
  padding: 60px 15px 0;
  @media print {
    padding-top: 0;
  }
`

const FooterContainer = styled.div`
  padding-left: 15px;
  padding-right: 15px;
`

const CreditText = styled.div`
  margin: 20px 0;
`

const PageTitle = styled.h1`
  @media print {
    margin-top: 0;
  }
`

const PageHeader = styled.div`
  @media print {
    margin-top: 0;
  }
`

const Footer = styled.div`
  height: 60px;
  background-color: #f5f5f5;
`

export const Template = ({ children }: { children: ReactNode }) => {
  const authInfo = useAuthInfo()
  const title = useCurrentTitle()

  return (
    <>
      <Wrap>
        <div className="navbar navbar-default navbar-fixed-top">
          <div className="container">
            <div className="navbar-header">
              <button
                type="button"
                className="navbar-toggle"
                data-toggle="collapse"
                data-target=".navbar-collapse"
              >
                <span className="icon-bar" />
                <span className="icon-bar" />
                <span className="icon-bar" />
              </button>
              <Link
                className="navbar-brand"
                to="/"
                title="Foreningen Blindern Studenterhjem"
              >
                FBS
              </Link>
            </div>
            <div className="collapse navbar-collapse">
              <ul className="nav navbar-nav">
                <MenuLink to={arrplanUrl()}>Arrangementplan</MenuLink>
                <MenuLink to={listBooksUrl()}>Biblioteket</MenuLink>
                <li className="dropdown">
                  <a href="" className="dropdown-toggle" data-toggle="dropdown">
                    Brukere og grupper <b className="caret" />
                  </a>
                  <ul className="dropdown-menu">
                    <MenuLink to={listUsersUrl()}>Brukerliste</MenuLink>
                    <MenuLink to={listGroupsUrl()}>Gruppeliste</MenuLink>
                  </ul>
                </li>
                <li className="dropdown">
                  <a href="" className="dropdown-toggle" data-toggle="dropdown">
                    Dugnaden <b className="caret" />
                  </a>
                  <ul className="dropdown-menu">
                    <MenuLink to={dugnadsinnkallingerUrl()}>
                      Dugnadsinnkalling
                    </MenuLink>
                  </ul>
                </li>
                <li className="dropdown">
                  <a href="" className="dropdown-toggle" data-toggle="dropdown">
                    Printer <b className="caret" />
                  </a>
                  <ul className="dropdown-menu">
                    <MenuLink to={lastPrintsUrl()}>Siste utskrifter</MenuLink>
                    <MenuLink to={printerInvocingUrl()}>Fakturering</MenuLink>
                  </ul>
                </li>
              </ul>
              <ul className="nav navbar-nav navbar-right">
                {authInfo.isLoading ? (
                  <li className="navbar-text">Laster ...</li>
                ) : authInfo.isError ? (
                  <li className="navbar-text">Ukjent feil</li>
                ) : authInfo.data.isLoggedIn ? (
                  <li className="dropdown">
                    <a
                      href=""
                      className="dropdown-toggle"
                      data-toggle="dropdown"
                    >
                      {authInfo.data.user.username} <b className="caret" />
                    </a>
                    <ul className="dropdown-menu">
                      <MenuLink to={`/user/${authInfo.data.user.username}`}>
                        Brukerinfo
                      </MenuLink>
                      <li>
                        <LogoutLink>Logg ut</LogoutLink>
                      </li>
                    </ul>
                  </li>
                ) : (
                  <>
                    <li>
                      <LoginLink>Logg inn</LoginLink>
                    </li>
                    <MenuLink to={registerUserUrl()}>Registrer</MenuLink>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        <WrapContainer className="container">
          <Flashes />

          <PageHeader className="page-header">
            <PageTitle>{title}</PageTitle>
          </PageHeader>

          <div id="content">{children}</div>
        </WrapContainer>
      </Wrap>

      <Footer className="hidden-print">
        <FooterContainer className="container">
          <CreditText className="text-muted">
            <a href="/">Foreningen Blindern Studenterhjem</a> - Org.nr{" "}
            <a href="https://w2.brreg.no/enhet/sok/detalj.jsp?orgnr=982118387">
              982 118 387
            </a>{" "}
            - Kontakt{" "}
            <a href="mailto:it-gruppa@foreningenbs.no">
              it-gruppa@foreningenbs.no
            </a>{" "}
            ved henvendelser vedr. denne siden -{" "}
            <a href="https://github.com/blindern/intern">GitHub-prosjekt</a>
          </CreditText>
        </FooterContainer>
      </Footer>
    </>
  )
}
