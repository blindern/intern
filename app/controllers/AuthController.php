<?php

use Blindern\Intern\Helpers\Flash;
use Blindern\Intern\Helpers\FlashCollection;
use Blindern\Intern\Passtools\pw;

class AuthController extends Controller {
	/**
	 * Register new user request
	 */
	public function register() {
		if (!Input::has('firstname') || !Input::has('lastname') ||
			!Input::has('email') || !Input::has('username') || !Input::has('password'))
			return Flash::forge('Data missing.')->setError()->asResponse(null, 400);

		$data = array(
			'firstname' => Input::get('firstname'),
			'lastname' => Input::get('lastname'),
			'username' => Input::get('username'),
			'email' => Input::get('email'),
			'password' => Input::get('password'),
			'phone' => Input::get('phone')
		);

		// TODO: unique username and email
		$validator = Validator::make($data, array(
			'firstname' => 'required',
			'lastname' => 'required',
			'username' => 'required|min:4|max:20|regex:/^[a-z][a-z0-9]+$/',
			'email' => 'required|email',
			'password' => 'required|min:8',
			'phone' => 'digits:8' // the frontend restricts this further by not allowing 0 in beginning
		));

		if ($validator->fails())
		{
			$c = FlashCollection::forge();
			foreach ($validator->messages()->all(':message') as $message)
			{
				$c->add(Flash::forge($message)->setError());
			}
			return $c->asResponse(null, 400);
		}

		$smbpass = pw::smbpass($data['password']);
		$unixpass = pw::unixpass($data['password']);

		$replyto = preg_replace("/\s/", "", $data['email']);
		$data['username'] = strtolower($data['username']);

		$data['phone'] = !empty($data['phone']) ? $data['phone'] : '';

		// lag fil som kan brukes
		setlocale(LC_CTYPE, "nb_NO.UTF-8");
		$n = uniqid().".sh";
		$f = "/fbs/drift/nybruker/$n";
		file_put_contents($f,
"FIRSTNAME=".escapeshellarg($data['firstname'])."
LASTNAME=".escapeshellarg($data['lastname'])."
USERNAME=".escapeshellarg($data['username'])."
MAIL=".escapeshellarg($data['email'])."
PHONE=".escapeshellarg($data['phone'])."
PASS=".escapeshellarg($unixpass)."
NTPASS=".escapeshellarg($smbpass)."
");

		// send forespørsel
		$res = mail("it-gruppa@foreningenbs.no", "Foreningsbruker - {$data['username']}", "Ønsker opprettelse av foreningsbruker:


Info til IT-gruppa:

Fornavn: \"{$data['firstname']}\"
Etternavn: \"{$data['lastname']}\"
E-post: \"{$data['email']}\"
Ønsket brukernavn: \"{$data['username']}\"
Mobilnr: ".($data['phone'] ? "\"{$data['phone']}\"" : "ikke registrert")."

Kommando for å opprette:
/fbs/drift/nybruker/process.sh $n

Tekst til bs-info-lista:
{$data['email']} {$data['firstname']} {$data['lastname']}


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
