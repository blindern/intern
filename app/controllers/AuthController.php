<?php

use Blindern\Intern\Helpers\Flash;
use Blindern\Intern\Helpers\FlashCollection;
use Blindern\Intern\Passtools\pw;

class AuthController extends Controller {
	/**
	 * Register new user request
	 */
	public function register() {
		// TODO: proper validation (see client validation)
		if (!Input::has('firstname') || !Input::has('lastname') ||
			!Input::has('email') || !Input::has('username') || !Input::has('password'))
			return Flash::forge('Data missing.')->setError()->asResponse(null, 400);

		$firstname = Input::get('firstname');
		$lastname = Input::get('lastname');
		$username = Input::get('username');
		$email = Input::get('email');
		$password = Input::get('password');
		$phone = Input::get('phone');
		$internmail = (bool)Input::get('internmail');

		if (strlen($password) < 8)
			return Flash::forge('Passordet må være minst 8 tegn.')->setError()->asResponse(null, 400);

		$smbpass = pw::smbpass($password);
		$unixpass = pw::unixpass($password);

		$replyto = preg_replace("/\s/", "", $email);
		$username = strtolower($username);

		$phone = !empty($phone) ? $phone : '';

		// lag fil som kan brukes
		$n = uniqid().".sh";
		$f = "/fbs/drift/nybruker/$n";
		file_put_contents($f,
"FIRSTNAME=".escapeshellarg($firstname)."
LASTNAME=".escapeshellarg($lastname)."
USERNAME=".escapeshellarg($username)."
MAIL=".escapeshellarg($email)."
PHONE=".escapeshellarg($phone)."
PASS=".escapeshellarg($unixpass)."
NTPASS=".escapeshellarg($smbpass)."
");

		// send forespørsel
		$res = mail("it-gruppa@foreningenbs.no", "Foreningsbruker - {$username}", "Ønsker opprettelse av foreningsbruker:


Info til IT-gruppa:

Fornavn: \"{$firstname}\"
Etternavn: \"{$lastname}\"
E-post: \"{$email}\"
Ønsket brukernavn: \"{$username}\"
Mobilnr: ".($phone ? "\"$phone\"" : "ikke registrert")."

Kommando for å opprette:
/fbs/drift/nybruker/process.sh $n

Internmail: ".($internmail ? "Ja
**********************
** MERK: INTERNMAIL **
{$email} {$firstname} {$lastname}
**********************" : 'Nei')."


Sendt fra {$_SERVER['REMOTE_ADDR']}
{$_SERVER['HTTP_USER_AGENT']}", "From: lpadmin@foreningenbs.no\r\nReply-To: $replyto");

		if (!$res) {
			return Flash::forge("Kunne ikke legge til forespørsel. Kontakt <a href=\"mailto:it-gruppa@foreningenbs.no\">IT-gruppa</a>!")
				->setError()->asResponse(null, 500);
		}

		return Flash::forge('Din forespørsel er nå sendt. Du får svar på e-post når brukeren er registrert.')
			->setSuccess()->asResponse();
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

		return Flash::forge('Ukjent brukernavn eller passord.')->setError()->asResponse(null, 401);
	}

	public function logout() {
		Auth::logout();
		return Flash::forge("Logget ut")->setSuccess()->asResponse();
	}
}
