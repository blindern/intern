<?php

use Blindern\Intern\Passtools\pw;

class AuthController extends Controller {
	public function register() {
		// registrere?
		if (isset($_POST['fornavn']) && isset($_POST['etternavn']) && isset($_POST['email']) && isset($_POST['username']) && isset($_POST['password']))
		{
			if (strlen($_POST['password']) < 8)
				return Response::json(array('flash' => array('message' => 'Passordet må være minst 8 tegn.')));

			$smbpass = pw::smbpass($_POST['password']);
			$unixpass = pw::unixpass($_POST['password']);

			$replyto = preg_replace("/\s/", "", $_POST['email']);
			$_POST['username'] = strtolower($_POST['username']);

			$phone = isset($_POST['phone']) ? $_POST['phone'] : '';

			// lag fil som kan brukes
			$n = uniqid().".sh";
			$f = "/fbs/drift/nybruker/$n";
			file_put_contents($f,
"FIRSTNAME=".escapeshellarg($_POST['fornavn'])."
LASTNAME=".escapeshellarg($_POST['etternavn'])."
USERNAME=".escapeshellarg($_POST['username'])."
MAIL=".escapeshellarg($_POST['email'])."
PHONE=".escapeshellarg($phone)."
PASS=".escapeshellarg($unixpass)."
NTPASS=".escapeshellarg($smbpass)."
");

			// send forespørsel
			$res = mail("it-gruppa@foreningenbs.no", "Foreningsbruker - {$_POST['username']}", "Ønsker opprettelse av foreningsbruker:


Info til IT-gruppa:

Fornavn: \"{$_POST['fornavn']}\"
Etternavn: \"{$_POST['etternavn']}\"
E-post: \"{$_POST['email']}\"
Ønsket brukernavn: \"{$_POST['username']}\"
Mobilnr: ".($phone ? "\"$phone\"" : "ikke registrert")."

Kommando for å opprette:
/fbs/drift/nybruker/process.sh $n

Internmail: ".(isset($_POST['internmail']) ? "Ja
**********************
** MERK: INTERNMAIL **
{$_POST['email']} {$_POST['fornavn']} {$_POST['etternavn']}
**********************" : 'Nei')."


Sendt fra {$_SERVER['REMOTE_ADDR']}
{$_SERVER['HTTP_USER_AGENT']}", "From: lpadmin@foreningenbs.no\r\nReply-To: $replyto");

			if (!$res) {
				return Response::json(array('flash' => array(
					'message' => "Kunne ikke legge til forespørsel. Kontakt <a href=\"mailto:it-gruppa@foreningenbs.no\">IT-gruppa</a>!",
					'type' => 'danger')));
			}

			return Response::json(array('flash' => array(
				'message' => 'Din forespørsel er nå sendt. Du får svar på e-post når brukeren er registrert.',
				'type' => 'success')));
		}
	}

	public function login() {
		$user = array(
			'username' => Input::get('username'),
			'password' => Input::get('password')
		);

		$res = Auth::attempt($user, Input::get('remember_me'));
		if ($res)
		{
			return Response::json(array(
				'user' => Auth::user()->toArray(array(), 2),
				'useradmin' => Auth::member('useradmin')
			));
		}

		return Response::json(array(
			'flash' => array(
				'message' => 'Ukjent brukernavn eller passord.'
			)
		));
	}

	public function logout() {
		Auth::logout();
		return Response::json(array(
			'flash' => array(
				'message' => 'Logget ut.'
			)
		));
	}
}
