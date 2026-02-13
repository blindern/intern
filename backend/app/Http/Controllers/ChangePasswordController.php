<?php namespace App\Http\Controllers;

use Blindern\Intern\Auth\UsersApiClient;
use Blindern\Intern\Passtools\pw;
use Blindern\Intern\Responses;
use Illuminate\Support\Facades\Log;

class ChangePasswordController extends Controller
{
    public function change()
    {
        $user = \Auth::user();
        if (!$user) {
            return Responses::invalidAuth(['Du må være logget inn.']);
        }

        $currentPassword = request()->input('currentPassword');
        $newPassword = request()->input('newPassword');

        if (!$currentPassword || !$newPassword) {
            return Responses::clientError(['Begge passordfelt må fylles ut.']);
        }

        if (strlen($newPassword) < 8) {
            return Responses::clientError(['Nytt passord må være på minst 8 tegn.']);
        }

        $client = new UsersApiClient();

        try {
            if (!$client->verifyCredentials($user->username, $currentPassword)) {
                return Responses::clientError(['Nåværende passord er feil.']);
            }

            $passwordHash = pw::unixpass($newPassword);
            $response = $client->modifyUser($user->username, [
                'passwordHash' => ['value' => $passwordHash],
            ]);
        } catch (\Exception $e) {
            Log::error('Password change failed due to users-api error', [
                'username' => $user->username,
                'error' => $e->getMessage(),
            ]);
            return Responses::serverError(['Kunne ikke kontakte brukertjenesten. Prøv igjen senere.']);
        }

        if (!$response->successful()) {
            Log::error('Failed to change password via users-api', [
                'username' => $user->username,
                'status' => $response->status(),
                'error' => $response->body(),
            ]);
            return Responses::serverError(['Kunne ikke oppdatere passord. Prøv igjen senere.']);
        }

        Log::info('Password changed', ['username' => $user->username]);

        return Responses::success(['Passordet er oppdatert.']);
    }
}
