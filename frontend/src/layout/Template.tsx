import classNames from 'classnames'
import { authService } from 'modules/core/auth'
import { AuthContext } from 'modules/core/auth/UserProvider'
import Flashes from 'modules/core/flashes/Flashes'
import { useTitle } from 'modules/core/title/TitleProvider'
import React, { ReactNode, useCallback, useContext } from 'react'
import { Link, useMatch } from 'react-router-dom'
import styled from 'styled-components'
import './frontend.scss'

const MenuLink = ({ children, to }: { children: ReactNode; to: string }) => {
  const isActive = useMatch(to) != null

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

const Template = ({ children }: { children: ReactNode }) => {
  const authdata = useContext(AuthContext)
  const title = useTitle()
  const logout = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    // TODO: Handle rejection.
    void authService.logout()
  }, [])

  return (
    <>
      <Wrap>
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
                {authdata.isLoggedIn ? (
                  <li className='dropdown'>
                    <a
                      href=''
                      className='dropdown-toggle'
                      data-toggle='dropdown'
                    >
                      {authdata.user.username} <b className='caret' />
                    </a>
                    <ul className='dropdown-menu'>
                      <MenuLink to={`/user/${authdata.user.username}`}>
                        Brukerinfo
                      </MenuLink>
                      <li>
                        <a href='logout' onClick={logout}>
                          Logg ut
                        </a>
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

        <WrapContainer className='container'>
          <Flashes />

          <PageHeader className='page-header'>
            <PageTitle>{title}</PageTitle>
          </PageHeader>

          <div id='content'>{children}</div>
        </WrapContainer>
      </Wrap>

      <Footer className='hidden-print'>
        <FooterContainer className='container'>
          <CreditText className='text-muted'>
            <a href='/'>Foreningen Blindern Studenterhjem</a> - Kontakt{' '}
            <a href='mailto:it-gruppa@foreningenbs.no'>
              it-gruppa@foreningenbs.no
            </a>{' '}
            ved henvendelser vedr. denne siden -{' '}
            <a href='https://github.com/blindern/intern'>GitHub-prosjekt</a>
          </CreditText>
        </FooterContainer>
      </Footer>
    </>
  )
}

export default Template
