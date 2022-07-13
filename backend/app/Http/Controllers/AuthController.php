<?php namespace App\Http\Controllers;

use App\Mail\RegisterUser;
use Blindern\Intern\Responses;
use Blindern\Intern\Passtools\pw;
use Illuminate\Support\Facades\Mail;

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

        $data['username'] = strtolower($data['username']);

        $data['phone'] = !empty($data['phone']) ? $data['phone'] : '';

        // lag fil som kan brukes
        $filename = uniqid().".sh";
        $f = storage_path('user-requests') . "/$filename";
        file_put_contents($f,
"FIRSTNAME=".escapeshellarg($data['firstname'])."
LASTNAME=".escapeshellarg($data['lastname'])."
USERNAME=".escapeshellarg($data['username'])."
MAIL=".escapeshellarg($data['email'])."
PHONE=".escapeshellarg($data['phone'])."
PASS=".escapeshellarg($unixpass)."
NTPASS=".escapeshellarg($smbpass)."
");

        $data['filename'] = $filename;

        // send forespørsel
        $to = env("REGISTERUSER_NOTIFY_EMAIL", "it-gruppa@foreningenbs.no");

        $res = Mail::to($to)->send(new RegisterUser($data, $filename));

        if (!$res) {
            return Responses::serverError(["Kunne ikke legge til forespørsel. Kontakt IT-gruppa!"]);
        }

        return Responses::success(['Din forespørsel er nå sendt. Du får svar på e-post når brukeren er registrert.']);
    }
}
