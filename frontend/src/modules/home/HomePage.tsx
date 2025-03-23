import { LoginLink } from "components/LoginLink.js"
import { ArrplanHomeBox } from "modules/arrplan/ArrplanHomeBox.js"
import { useAuthInfo } from "modules/core/auth/AuthInfoProvider.js"
import { MatmenyHomeBox } from "modules/matmeny/MatmenyHomeBox.js"
import { UserLink } from "modules/users/UserLink.js"

export const HomePage = () => {
  const authInfo = useAuthInfo()

  return (
    <>
      <p>
        Foreningen Blindern Studenterhjem er en sosial forening, hvis formål er
        å skape, drive og tilrettelegge muligheten for sosiale aktiviteter for
        både nåværende og fremtidige beboere på Blindern Studenterhjem. For mer
        informasjon om Blindern Studenterhjem og foreningen, se{" "}
        <a href="https://www.blindern-studenterhjem.no/livet/foreningsstyret/">
          {"https://www.blindern-studenterhjem.no/livet/foreningsstyret/"}
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
              <i>Gjeldende vår 2024</i>
            </p>
            <p>
              <strong>(Matsalen stenger ved tidspunktene i parentes)</strong>
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
                  <td>Man-tor</td>
                  <td>
                    07.15-
                    <br />
                    08.55
                    <br />
                    (09.30)
                  </td>
                  <td>
                    15.00-
                    <br />
                    17.30
                    <br />
                    (17.45)
                  </td>
                  <td>
                    19.30-
                    <br />
                    20.25
                    <br />
                    (20.45)
                  </td>
                </tr>
                <tr>
                  <td>Fre</td>
                  <td>
                    07.15-
                    <br />
                    08.55
                    <br />
                    (09.30)
                  </td>
                  <td>
                    15.00-
                    <br />
                    17.30
                    <br />
                    (17.45)
                  </td>
                  <td>
                    Matpakkestasjon
                    <br />
                    15.00-
                    <br />
                    17.30
                  </td>
                </tr>

                <tr>
                  <td>Lør</td>
                  <td>
                    08.00-
                    <br />
                    10.00
                    <br />
                    (10.30)
                  </td>
                  <td>
                    16.00-
                    <br />
                    17.30
                    <br />
                    (18.00)
                  </td>
                  <td>
                    Matpakkestasjon
                    <br />
                    16.00-
                    <br />
                    17.30
                  </td>
                </tr>
                <tr>
                  <td>Søn</td>
                  <td>
                    10.00-
                    <br />
                    11.30
                    <br />
                    (12.00)
                  </td>
                  <td>
                    17.00-
                    <br />
                    18.30
                    <br />
                    (18.45)
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
            <a href="https://www.blindern-studenterhjem.no/">
              <span>
                Blindern Studenterhjems
                <br />
                offisielle nettside
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
                  Wiki / beboerside{" "}
                  <span>(&laquo;alt&raquo; du trenger å vite om BS)</span>
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
            <a href="https://foreningenbs.no/slack/">
              <span>Slack</span>
            </a>
          </p>
        </div>
        <div className="col-sm-3">
          <p>
            <a href="https://foreningenbs.no/confluence/display/BS/Printer">
              <span>
                Printer <span>(oppsett, veiledning, feilsøking m.v.)</span>
              </span>
            </a>
          </p>
        </div>
      </div>

      <div className="row fbs_forside_lenker small">
        <div className="col-sm-2">
          <p>
            <a href="https://foreningenbs.no/smaabruket/">
              <span>
                Småbruket studenthytte <span>(foreningens hytte)</span>
              </span>
            </a>
          </p>
        </div>
        <div className="col-sm-2">
          <p>
            <a href="https://foreningenbs.no/dugnaden/">
              <span>Dugnaden</span>
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
            <a href="https://foreningenbs.no/filer/">
              <span>Filer</span>
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
            <a href="https://foreningenbs.no/tools/">
              <span>
                Verktøykasse <span>(for IT-gruppa)</span>
              </span>
            </a>
          </p>
        </div>
      </div>

      <hr />

      {authInfo.data.isLoggedIn ? (
        <p>
          Du er innlogget som{" "}
          <UserLink username={authInfo.data.user.username} /> (
          {authInfo.data.user.realname}).
        </p>
      ) : !authInfo.isError && !authInfo.isLoading ? (
        <p>
          Du får flere handlinger ved å{" "}
          <LoginLink>logge inn med foreningsbrukeren din</LoginLink>.
        </p>
      ) : null}
    </>
  )
}
