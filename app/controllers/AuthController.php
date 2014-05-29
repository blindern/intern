<?php

use Blindern\Intern\Passtools\pw;

class AuthController extends Controller {
	public function get_login() {
		return View::make('auth/login');
	}

	public function post_login() {
		// registrere?
		if (isset($_POST['fornavn']) && isset($_POST['etternavn']) && isset($_POST['email']) && isset($_POST['username']) && isset($_POST['password']))
		{
			if (strlen($_POST['password']) < 8)
				return View::make('auth/login', array(
					"reg_msg_class" => "danger",
					"reg_msg" => "Passordet må være minst 8 tegn."));

			$smbpass = pw::smbpass($_POST['password']);
			$unixpass = pw::unixpass($_POST['password']);

			$replyto = preg_replace("/\s/", "", $_POST['email']);
			$_POST['username'] = strtolower($_POST['username']);

			$phone = isset($_POST['phone']) ? $_POST['phone'] : '';

			// send forespørsel
			$res = mail("it-gruppa@foreningenbs.no", "Foreningsbruker - {$_POST['username']}", "Ønsker opprettelse av foreningsbruker:

Info til admin:

Kommandoer:
smbldap-useradd -a -N \"{$_POST['fornavn']}\" -S \"{$_POST['etternavn']}\" {$_POST['username']}
ldapaddusertogroup {$_POST['username']} beboer
ldapmodifyuser {$_POST['username']}

changetype: modify
replace: userPassword
userPassword: $unixpass
-
replace: sambaNTPassword
sambaNTPassword: $smbpass
-
replace: mail
mail: {$_POST['email']}".($phone ? "
-
replace: mobile
mobile: $phone" : "")."


Internmail: ".(isset($_POST['internmail']) ? 'Ja
**********************
** MERK: INTERNMAIL **
**********************' : 'Nei')."


Sendt fra {$_SERVER['REMOTE_ADDR']}
{$_SERVER['HTTP_USER_AGENT']}", "From: lpadmin@foreningenbs.no\r\nReply-To: $replyto");

			if (!$res) {
				return View::make('auth/login', array(
					"reg_msg_class" => "danger",
					"reg_msg" => "Kunne ikke legge til forespørsel. Kontakt <a href=\"mailto:it-gruppa@foreningenbs.no\">IT-gruppa</a>!"));
			}

			//echo "Din forespørsel er nå sendt. Du får svar når brukeren er klar.";

			return View::make('auth/login', array(
				"reg_msg_class" => "success",
				"reg_msg" => "Din forespørsel er nå sendt. Du får svar når brukeren er klar."));
		}

		$user = array(
			'username' => Input::get('username'),
			'password' => Input::get('password')
		);

		$res = Auth::attempt($user, Input::get('remember_me'));
		if ($res)
		{
			return Redirect::to('/user/'.Auth::user()->username);
		}

		return View::make('auth/login', array(
			"login_error" => 'Ukjent brukernavn eller passord.'));
	}

	public function action_logout() {
		Auth::logout();
		return Redirect::to('/');
	}
}
