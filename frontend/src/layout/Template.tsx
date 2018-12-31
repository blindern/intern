import classNames from 'classnames'
import { UserContext } from 'modules/core/auth/UserProvider'
import Flashes from 'modules/core/flashes/Flashes'
import { useTitle } from 'modules/core/title/TitleProvider'
import React, { ReactNode, useContext } from 'react'
import { Route } from 'react-router'
import { Link } from 'react-router-dom'
import './frontend.scss'

interface IMenuLinkProps {
  children: ((renderProps: { isActive: boolean }) => ReactNode)
  exact?: boolean
  strict?: boolean
  to: string | { pathname: string }
}

const IsActive = ({ exact, strict, to, children }: IMenuLinkProps) => {
  const path = typeof to === 'object' ? to.pathname : to

  // Regex taken from: https://github.com/pillarjs/path-to-regexp/blob/master/index.js#L202
  const escapedPath = path && path.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1')

  return (
    <Route
      path={escapedPath}
      exact={exact}
      strict={strict}
      children={({ match }) => children({ isActive: !!match })}
    />
  )
}

const MenuLink = ({ children, to }: { children: ReactNode; to: string }) => (
  <IsActive to={to}>
    {({ isActive }) => (
      <li className={classNames({ active: isActive })}>
        <Link to={to}>{children}</Link>
      </li>
    )}
  </IsActive>
)

const Template = ({ children }: { children: ReactNode }) => {
  const userdata = useContext(UserContext)
  const title = useTitle()

  return (
    <>
      <div id='wrap'>
        <div className='navbar navbar-default navbar-fixed-top'>
          <div className='container'>
            <div className='navbar-header'>
              <button
                type='button'
                className='navbar-toggle'
                data-toggle='collapse'
                data-target='.navbar-collapse'
              >
                <span className='icon-bar' />
                <span className='icon-bar' />
                <span className='icon-bar' />
              </button>
              <Link
                className='navbar-brand'
                to='/'
                title='Foreningen Blindern Studenterhjem'
              >
                FBS
              </Link>
            </div>
            <div className='collapse navbar-collapse'>
              <ul className='nav navbar-nav'>
                <MenuLink to='/arrplan'>Arrangementplan</MenuLink>
                <MenuLink to='/books'>Biblioteket</MenuLink>
                <li className='dropdown'>
                  <a href='' className='dropdown-toggle' data-toggle='dropdown'>
                    Brukere og grupper <b className='caret' />
                  </a>
                  <ul className='dropdown-menu'>
                    <MenuLink to='/users'>Brukerliste</MenuLink>
                    <MenuLink to='/groups'>Gruppeliste</MenuLink>
                  </ul>
                </li>
                <li className='dropdown'>
                  <a href='' className='dropdown-toggle' data-toggle='dropdown'>
                    Dugnaden <b className='caret' />
                  </a>
                  <ul className='dropdown-menu'>
                    <MenuLink to='/dugnaden/old/list'>
                      Dugnadsinnkalling
                    </MenuLink>
                  </ul>
                </li>
                <li className='dropdown'>
                  <a href='' className='dropdown-toggle' data-toggle='dropdown'>
                    Printer <b className='caret' />
                  </a>
                  <ul className='dropdown-menu'>
                    <MenuLink to='/printer/siste'>Siste utskrifter</MenuLink>
                    <MenuLink to='/printer/fakturere'>Fakturering</MenuLink>
                  </ul>
                </li>
              </ul>
              <ul className='nav navbar-nav navbar-right'>
                {userdata.isLoggedIn ? (
                  <li className='dropdown'>
                    <a
                      href=''
                      className='dropdown-toggle'
                      data-toggle='dropdown'
                    >
                      {userdata.user.username} <b className='caret' />
                    </a>
                    <ul className='dropdown-menu'>
                      <MenuLink to={`/user/${userdata.user.username}`}>
                        Brukerinfo
                      </MenuLink>
                      <li>
                        <a href='logout'>Logg ut</a>
                      </li>
                    </ul>
                  </li>
                ) : (
                  <>
                    <MenuLink to='/login'>Logg inn</MenuLink>
                    <MenuLink to='/registrer'>Registrer</MenuLink>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className='container'>
          <Flashes />

          <div className='page-header'>
            <h1 id='page_title'>{title}</h1>
          </div>

          <div id='content'>{children}</div>
        </div>
      </div>

      <div id='footer' className='hidden-print'>
        <div className='container'>
          <p className='text-muted credit'>
            <a href='/'>Foreningen Blindern Studenterhjem</a> - Kontakt{' '}
            <a href='mailto:it-gruppa@foreningenbs.no'>
              it-gruppa@foreningenbs.no
            </a>{' '}
            ved henvendelser vedr. denne siden -{' '}
            <a href='https://github.com/blindern/intern'>GitHub-prosjekt</a>
          </p>
        </div>
      </div>
    </>
  )
}

export default Template
