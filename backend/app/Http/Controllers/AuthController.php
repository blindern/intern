<?php namespace App\Http\Controllers;

use Blindern\Intern\Responses;
use Blindern\Intern\Passtools\pw;

class AuthController extends Controller
{
    /**
     * Register new user request
     */
    public function register()
    {
        if (!\Request::has('firstname') || !\Request::has('lastname') ||
            !\Request::has('email') || !\Request::has('username') || !\Request::has('password')) {
            return Responses::clientError(['Data missing.']);
        }

        $data = array(
            'firstname' => \Request::input('firstname'),
            'lastname' => \Request::input('lastname'),
            'username' => \Request::input('username'),
            'email' => \Request::input('email'),
            'password' => \Request::input('password'),
            'phone' => \Request::input('phone')
        );

        // TODO: unique username and email
        $validator = \Validator::make($data, array(
            'firstname' => 'required',
            'lastname' => 'required',
            'username' => 'required|min:4|max:20|regex:/^[a-z][a-z0-9]+$/',
            'email' => 'required|email',
            'password' => 'required|min:8',
            'phone' => 'digits:8' // the frontend restricts this further by not allowing 0 in beginning
        ));

        if ($validator->fails()) {
            $messages = [];
            foreach ($validator->messages()->all(':message') as $message) {
                $messages[] = [
                    'type' => 'danger',
                    'message' => $message,
                ];
            }
            return Response::json(['messages' => $messages], 400);
        }

        $smbpass = pw::smbpass($data['password']);
        $unixpass = pw::unixpass($data['password']);

        $replyto = preg_replace("/\s/", "", $data['email']);
        $data['username'] = strtolower($data['username']);

        $data['phone'] = !empty($data['phone']) ? $data['phone'] : '';

        // lag fil som kan brukes
        setlocale(LC_CTYPE, "nb_NO.UTF-8");
        $n = uniqid().".sh";
        $f = "/var/www/users/$n";
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
            return Responses::serverError(["Kunne ikke legge til forespørsel. Kontakt IT-gruppa!"]);
        }

        return Responses::success(['Din forespørsel er nå sendt. Du får svar på e-post når brukeren er registrert.']);
    }
}
