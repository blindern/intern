import { ArrplanHomeBox } from "modules/arrplan/ArrplanHomeBox"
import { useAuthInfo } from "modules/core/auth/AuthInfoProvider"
import { MatmenyHomeBox } from "modules/matmeny/MatmenyHomeBox"
import { UserLink } from "modules/users/UserLink"
import React from "react"
import { Link } from "react-router-dom"

export const HomePage = () => {
  const authInfo = useAuthInfo()

  return (
    <>
      <p>
        Foreningen Blindern Studenterhjem er en sosial forening, hvis formål er
        å skape, drive og tilrettelegge muligheten for sosiale aktiviteter for
        både nåværende og fremtidige beboere på Blindern Studenterhjem. For mer
        informasjon om Blindern Studenterhjem og foreningen, se{" "}
        <a href="http://blindern-studenterhjem.no/livet/foreningsstyret">
          {"http://blindern-studenterhjem.no/livet/foreningsstyret"}
        </a>
        .
      </p>
      <p>
        Disse nettsidene er hovedsaklig myntet på foreningens medlemmer, og
        mange av sidene er beskyttet med passord.
      </p>

      <hr />

      <div className="row">
        <div className="col-md-4">
          <ArrplanHomeBox />
        </div>

        <div className="col-md-4">
          <MatmenyHomeBox />
        </div>

        <div className="col-md-4">
          <div className="index-matmeny">
            <h4>Måltider</h4>
            <p>
              <i>Oppdatert for høst 2021</i>
            </p>
            <table className="table">
              <thead>
                <tr>
                  <th>&nbsp;</th>
                  <th>Frokost</th>
                  <th>Middag</th>
                  <th>Kvelds</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Man-fre</td>
                  <td>
                    07.15-
                    <br />
                    09.00
                  </td>
                  <td>
                    15.00-
                    <br />
                    17.30
                  </td>
                  <td>
                    19.30-
                    <br />
                    20.25
                  </td>
                </tr>
                <tr>
                  <td>Lør</td>
                  <td>
                    08.00-
                    <br />
                    10.00
                  </td>
                  <td>
                    16.00-
                    <br />
                    17.30
                  </td>
                  <td>
                    Matpakkestasjon
                    <br />
                    16-18
                  </td>
                </tr>
                <tr>
                  <td>Søn</td>
                  <td>
                    10.00-
                    <br />
                    11.30
                  </td>
                  <td>
                    17.00-
                    <br />
                    18.30
                  </td>
                  <td>ingen</td>
                </tr>
              </tbody>
            </table>
            <p>
              Se også{" "}
              <a href="https://foreningenbs.no/confluence/x/eQYf">wiki</a> for
              mer detaljer.
            </p>
          </div>
        </div>
      </div>

      <hr />

      <div className="row fbs_forside_lenker">
        <div className="col-sm-3">
          <p>
            <a href="http://blindern-studenterhjem.no/">
              <span>
                Blindern Studenterhjems
                <br />
                offisielle nettside
              </span>
            </a>
          </p>
        </div>
        <div className="col-sm-3">
          <p>
            <a href="https://foreningenbs.no/confluence/plugins/servlet/samlsso?redirectTo=%2Fx%2FNgEf">
              <span>
                Beboerside og matmeny{" "}
                <span>(+ kontaktinformasjon oppmenn)</span>
              </span>
            </a>
          </p>
        </div>
        <div className="col-sm-3 wiki-box">
          <form
            className="form-inline"
            method="get"
            action="https://foreningenbs.no/wiki/"
          >
            <p>
              <a href="https://foreningenbs.no/confluence/plugins/servlet/samlsso?redirectTo=%2Fx%2FNgEf">
                <span>
                  Wiki <span>(&laquo;alt&raquo; du trenger å vite om BS)</span>
                </span>
              </a>
              <span className="search-box">
                <input
                  className="form-control"
                  type="text"
                  name="queryString"
                  placeholder="Hurtigsøk"
                />
              </span>
            </p>
          </form>
        </div>
        <div className="col-sm-3">
          <p>
            <a href="https://p.foreningenbs.no/">
              <span>
                Printeroppsett{" "}
                <span>(oppsett, veiledning, feilsøking m.v.)</span>
              </span>
            </a>
          </p>
        </div>
      </div>

      <div className="row fbs_forside_lenker small">
        <div className="col-sm-2">
          <p>
            <a href="/smaabruket/">
              <span>
                Småbruket studenthytte <span>(foreningens hytte)</span>
              </span>
            </a>
          </p>
        </div>
        <div className="col-sm-2">
          <p>
            <a href="/dugnaden/">
              <span>Dugnaden</span>
            </a>
          </p>
        </div>
        <div className="col-sm-2">
          <p>
            <a href="https://foreningenbs.no/confluence/plugins/servlet/samlsso?redirectTo=%2Fx%2FbQBV">
              <span>Økonomi i FBS</span>
            </a>
          </p>
        </div>
        <div className="col-sm-2">
          <p>
            <a href="/foreningen/">
              <span>
                Foreningens <b>dokumentområde</b>
              </span>
            </a>
          </p>
        </div>
        <div className="col-sm-2">
          <p>
            <a href="http://foreningenbs.no/statutter/">
              <span>Statutter, reglement, instrukser og retningslinjer</span>
            </a>
          </p>
        </div>
        <div className="col-sm-2">
          <p>
            <a href="/tools/">
              <span>
                Verktøykasse <span>(for IT-gruppa)</span>
              </span>
            </a>
          </p>
        </div>
      </div>

      <hr />

      {authInfo.isLoggedIn ? (
        <p>
          Du er innlogget som <UserLink username={authInfo.user.username} /> (
          {authInfo.user.realname}).
        </p>
      ) : (
        <p>
          Du får flere handlinger ved å{" "}
          <Link to="/login">logge inn med foreningsbrukeren din</Link>.
        </p>
      )}
    </>
  )
}
