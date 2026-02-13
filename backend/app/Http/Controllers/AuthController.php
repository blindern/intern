<?php namespace App\Http\Controllers;

use App\Mail\RegisterUser;
use Blindern\Intern\Auth\RegistrationRequest;
use Blindern\Intern\Auth\User;
use Blindern\Intern\Passtools\pw;
use Blindern\Intern\Responses;
use Illuminate\Support\Facades\Log;
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
            return \Response::json(['messages' => $messages], 400);
        }

        $data['username'] = strtolower($data['username']);
        $data['phone'] = !empty($data['phone']) ? $data['phone'] : null;

        // Validate uniqueness against LDAP and pending requests
        $existingUser = User::find($data['username']);
        $pendingUsername = RegistrationRequest::where('username', $data['username'])
            ->where('status', 'pending')
            ->exists();
        if ($existingUser || $pendingUsername) {
            return Responses::clientError(['Brukernavnet er allerede i bruk.']);
        }

        $existingEmail = User::findByEmail($data['email']);
        if ($existingEmail) {
            return Responses::clientError(['E-postadressen er allerede registrert. Bruk glemt passord for å tilbakestille passordet.']);
        }

        $pendingEmail = RegistrationRequest::where('email', $data['email'])
            ->where('status', 'pending')
            ->exists();
        if ($pendingEmail) {
            return Responses::clientError(['Det finnes allerede en ventende forespørsel med denne e-postadressen.']);
        }

        $passwordHash = pw::unixpass($data['password']);

        $request = RegistrationRequest::create([
            'username' => $data['username'],
            'firstname' => $data['firstname'],
            'lastname' => $data['lastname'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'password_hash' => $passwordHash,
            'status' => 'pending',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        // Send notification to IT-gruppa
        $to = config('auth.registeruser_notify_email');
        Mail::to($to)->send(new RegisterUser($data));

        Log::info('Registration submitted, notification sent', [
            'username' => $data['username'],
            'email' => $data['email'],
            'notify_to' => $to,
            'ip' => request()->ip(),
        ]);

        return Responses::success(['Din forespørsel er nå sendt. Du får svar på e-post når brukeren er registrert.']);
    }
}
