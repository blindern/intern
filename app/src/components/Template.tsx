import classNames from "classnames"
import { LoginLink } from "./LoginLink.js"
import { LogoutLink } from "./LogoutLink.js"
import { Flashes } from "./Flashes.js"
import { useAuthInfo } from "../features/auth/hooks.js"
import { useCurrentTitle } from "../hooks/useTitle.js"
import { ReactNode, useCallback, useEffect, useRef, useState } from "react"
import { Link, useLocation, useMatchRoute } from "@tanstack/react-router"
import type { FileRouteTypes } from "../routeTree.gen.js"

function MenuLink({
  children,
  to,
}: {
  children: ReactNode
  to: FileRouteTypes["to"]
}) {
  const matchRoute = useMatchRoute()
  const isActive = matchRoute({ to, fuzzy: true })

  return (
    <li className={classNames({ active: !!isActive })}>
      <Link to={to}>{children}</Link>
    </li>
  )
}

function Dropdown({
  label,
  children,
}: {
  label: ReactNode
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLLIElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        close()
      }
    }
    document.addEventListener("click", handler, true)
    return () => document.removeEventListener("click", handler, true)
  }, [open, close])

  return (
    <li ref={ref} className={classNames("dropdown", { open })}>
      <a
        href=""
        className="dropdown-toggle"
        onClick={(e) => {
          e.preventDefault()
          setOpen((v) => !v)
        }}
      >
        {label} <b className="caret" />
      </a>
      <ul className="dropdown-menu" onClick={close}>
        {children}
      </ul>
    </li>
  )
}

export function Template({ children }: { children: ReactNode }) {
  const authInfo = useAuthInfo()
  const title = useCurrentTitle()
  const [navOpen, setNavOpen] = useState(false)
  const { pathname } = useLocation()

  // Close mobile nav on route change
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setNavOpen(false), [pathname])

  return (
    <>
      <div className="tmpl-wrap">
        <div className="navbar navbar-default navbar-fixed-top">
          <div className="container">
            <div className="navbar-header">
              <button
                type="button"
                className="navbar-toggle"
                onClick={() => setNavOpen((v) => !v)}
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
            <div
              className={classNames("navbar-collapse", {
                collapse: !navOpen,
                in: navOpen,
              })}
            >
              <ul className="nav navbar-nav">
                <MenuLink to="/arrplan">Arrangementplan</MenuLink>
                <MenuLink to="/books">Biblioteket</MenuLink>
                <Dropdown label="Brukere og grupper">
                  <MenuLink to="/users">Brukerliste</MenuLink>
                  <MenuLink to="/groups">Gruppeliste</MenuLink>
                  {!authInfo.isLoading &&
                    !authInfo.isError &&
                    authInfo.data.isUserAdmin && (
                      <MenuLink to="/users/registrations">
                        Registreringer
                      </MenuLink>
                    )}
                </Dropdown>
                <Dropdown label="Dugnaden">
                  <MenuLink to="/dugnaden/old/list">Dugnadsinnkalling</MenuLink>
                </Dropdown>
                <Dropdown label="Printer">
                  <MenuLink to="/printer/siste">Siste utskrifter</MenuLink>
                  <MenuLink to="/printer/fakturere">Fakturering</MenuLink>
                </Dropdown>
              </ul>
              <ul className="nav navbar-nav navbar-right">
                {authInfo.isLoading ? (
                  <li className="navbar-text">Laster ...</li>
                ) : authInfo.isError ? (
                  <li className="navbar-text">Ukjent feil</li>
                ) : authInfo.data.isLoggedIn ? (
                  <Dropdown label={authInfo.data.user.username}>
                    <li>
                      <Link
                        to="/user/$name"
                        params={{ name: authInfo.data.user.username }}
                      >
                        Brukerinfo
                      </Link>
                    </li>
                    <MenuLink to="/change-password">Endre passord</MenuLink>
                    <li>
                      <LogoutLink>Logg ut</LogoutLink>
                    </li>
                  </Dropdown>
                ) : (
                  <>
                    <li>
                      <LoginLink>Logg inn</LoginLink>
                    </li>
                    <MenuLink to="/register">Registrer</MenuLink>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="tmpl-wrap-container container">
          <Flashes />

          {title && title !== "FBS" && (
            <div className="tmpl-page-header page-header">
              <h1 className="tmpl-page-title">{title}</h1>
            </div>
          )}

          <div id="content">{children}</div>
        </div>
      </div>

      <div className="tmpl-footer hidden-print">
        <div className="tmpl-footer-container container">
          <div className="tmpl-credit-text text-muted">
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
          </div>
        </div>
      </div>
    </>
  )
}
