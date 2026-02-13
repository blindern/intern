<?php namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Mail\RegistrationApproved;
use Blindern\Intern\Auth\RegistrationRequest;
use Blindern\Intern\Auth\UsersApiClient;
use Blindern\Intern\Responses;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class RegistrationRequestController extends Controller
{
    public function index()
    {
        if (!\Auth::member("useradmin")) {
            return Responses::forbidden(['Ingen tilgang.']);
        }

        $status = request()->query('status', 'pending');
        $query = RegistrationRequest::orderBy('created_at', 'desc');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        return $query->get();
    }

    public function approve(string $id)
    {
        if (!\Auth::member("useradmin")) {
            return Responses::forbidden(['Ingen tilgang.']);
        }

        return DB::transaction(function () use ($id) {
            $request = RegistrationRequest::lockForUpdate()->find($id);
            if (!$request) {
                return Responses::clientError(['Forespørsel ikke funnet.']);
            }

            if ($request->status !== 'pending') {
                return Responses::clientError(['Forespørselen er allerede behandlet.']);
            }

            $groups = request()->input('groups');
            if (!$groups || !is_array($groups) || count($groups) === 0) {
                return Responses::clientError(['Minst én gruppe må velges.']);
            }

            $client = new UsersApiClient();

            // Create user in LDAP via users-api
            $response = $client->createUser(
                $request->username,
                $request->firstname,
                $request->lastname,
                $request->email,
                $request->phone,
                $request->password_hash,
            );

            if (!$response->successful()) {
                $error = $response->body();
                Log::error('Failed to create user via users-api', [
                    'username' => $request->username,
                    'status' => $response->status(),
                    'error' => $error,
                ]);
                return Responses::serverError(["Kunne ikke opprette bruker: $error"]);
            }

            // Add user to groups
            foreach ($groups as $group) {
                $groupResponse = $client->addUserToGroup($group, $request->username);
                if (!$groupResponse->successful()) {
                    Log::error('Failed to add user to group', [
                        'username' => $request->username,
                        'group' => $group,
                        'status' => $groupResponse->status(),
                        'error' => $groupResponse->body(),
                    ]);
                }
            }

            $admin = \Auth::user();

            try {
                $request->update([
                    'status' => 'approved',
                    'group_name' => implode(', ', $groups),
                    'processed_by' => $admin->username,
                    'processed_at' => now(),
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to update registration request after LDAP user creation', [
                    'username' => $request->username,
                    'error' => $e->getMessage(),
                ]);
                return Responses::serverError(['Bruker opprettet i LDAP, men databaseoppdatering feilet. Kontakt administrator.']);
            }

            // Send approval email to user
            Mail::to($request->email)->send(new RegistrationApproved($request->username));

            Log::info('Registration approved, email sent', [
                'admin' => $admin->username,
                'username' => $request->username,
                'groups' => $groups,
                'email' => $request->email,
            ]);

            return response()->json(['status' => 'approved']);
        });
    }

    public function reject(string $id)
    {
        if (!\Auth::member("useradmin")) {
            return Responses::forbidden(['Ingen tilgang.']);
        }

        return DB::transaction(function () use ($id) {
            $request = RegistrationRequest::lockForUpdate()->find($id);
            if (!$request) {
                return Responses::clientError(['Forespørsel ikke funnet.']);
            }

            if ($request->status !== 'pending') {
                return Responses::clientError(['Forespørselen er allerede behandlet.']);
            }

            $admin = \Auth::user();
            $request->update([
                'status' => 'rejected',
                'processed_by' => $admin->username,
                'processed_at' => now(),
            ]);

            Log::info('Registration rejected', [
                'admin' => $admin->username,
                'username' => $request->username,
            ]);

            return response()->json(['status' => 'rejected']);
        });
    }
}
