<?php namespace App\Http\Controllers;

use App\Mail\PasswordReset;
use Blindern\Intern\Auth\PasswordResetToken;
use Blindern\Intern\Auth\User;
use Blindern\Intern\Auth\UsersApiClient;
use Blindern\Intern\Passtools\pw;
use Blindern\Intern\Responses;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    public function requestReset()
    {
        $email = request()->input('email');
        if (!$email) {
            return Responses::clientError(['E-postadresse må oppgis.']);
        }

        // Rate limit: check if a token for this email was created in the last 5 minutes
        $recentToken = PasswordResetToken::where('email', $email)
            ->where('created_at', '>', now()->subMinutes(5))
            ->first();

        if ($recentToken) {
            $retryAfter = max(1, $recentToken->created_at->addMinutes(5)->getTimestamp() - now()->getTimestamp());
            Log::info('Password reset rate-limited', ['email' => $email]);
            return Responses::clientError(["Vennligst vent $retryAfter sekunder før du prøver igjen."]);
        }

        // Look up user by email
        $user = User::findByEmail($email);
        if (!$user) {
            Log::info('Password reset requested, user not found', ['email' => $email]);
            return Responses::clientError(['Ingen bruker med denne e-postadressen ble funnet.']);
        }

        // Generate token
        $token = Str::random(64);
        $tokenHash = hash('sha256', $token);

        PasswordResetToken::create([
            'token_hash' => $tokenHash,
            'username' => $user->username,
            'email' => $email,
            'expires_at' => now()->addHour(),
            'used' => false,
        ]);

        // Send email
        Mail::to($email)->send(new PasswordReset($user->realname, $user->username, $token));

        Log::info('Password reset email sent', ['email' => $email, 'username' => $user->username]);

        return Responses::success(['En lenke for å tilbakestille passordet er sendt til din e-postadresse.']);
    }

    public function validateToken()
    {
        $token = request()->input('token');
        if (!$token) {
            return Responses::clientError(['Token må oppgis.']);
        }

        $error = $this->findValidToken($token)[1];
        if ($error) {
            return Responses::clientError([$error]);
        }

        return response()->json(['valid' => true]);
    }

    /**
     * @return array{PasswordResetToken|null, string|null}
     */
    private function findValidToken(string $token): array
    {
        $tokenHash = hash('sha256', $token);
        $resetToken = PasswordResetToken::where('token_hash', $tokenHash)->first();

        if (!$resetToken) {
            return [null, 'Ugyldig eller utløpt lenke.'];
        }

        if ($resetToken->used) {
            return [null, 'Denne lenken er allerede brukt.'];
        }

        if ($resetToken->expires_at->isPast()) {
            return [null, 'Lenken har utløpt. Vennligst be om en ny.'];
        }

        return [$resetToken, null];
    }

    public function resetPassword()
    {
        $token = request()->input('token');
        $password = request()->input('password');

        if (!$token || !$password) {
            return Responses::clientError(['Token og passord må oppgis.']);
        }

        if (strlen($password) < 8) {
            return Responses::clientError(['Passordet må være på minst 8 tegn.']);
        }

        [$resetToken, $error] = $this->findValidToken($token);
        if ($error) {
            return Responses::clientError([$error]);
        }

        // Hash password and update via users-api
        $passwordHash = pw::unixpass($password);
        $client = new UsersApiClient();
        $response = $client->modifyUser($resetToken->username, [
            'passwordHash' => ['value' => $passwordHash],
        ]);

        if (!$response->successful()) {
            Log::error('Failed to reset password via users-api', [
                'username' => $resetToken->username,
                'status' => $response->status(),
                'error' => $response->body(),
            ]);
            return Responses::serverError(['Kunne ikke oppdatere passord. Prøv igjen senere.']);
        }

        // Invalidate all tokens for this user
        PasswordResetToken::where('username', $resetToken->username)
            ->where('used', false)
            ->update(['used' => true]);

        Log::info('Password reset completed', ['username' => $resetToken->username]);

        return Responses::success(['Passordet er oppdatert. Du kan nå logge inn.']);
    }
}
