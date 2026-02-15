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

        $groups = request()->input('groups');
        if (!$groups || !is_array($groups) || count($groups) === 0) {
            return Responses::clientError(['Minst én gruppe må velges.']);
        }

        $result = DB::transaction(function () use ($id, $groups) {
            $request = RegistrationRequest::lockForUpdate()->find($id);
            if (!$request) {
                return ['error' => Responses::clientError(['Forespørsel ikke funnet.'])];
            }

            if ($request->status !== 'pending') {
                return ['error' => Responses::clientError(['Forespørselen er allerede behandlet.'])];
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
                return ['error' => Responses::serverError(["Kunne ikke opprette bruker: $error"])];
            }

            // Add user to groups
            foreach ($groups as $group) {
                $groupResponse = $client->addMemberToGroup($group, 'users', $request->username);
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

            $request->update([
                'status' => 'approved',
                'group_name' => implode(', ', $groups),
                'processed_by' => $admin->username,
                'processed_at' => now(),
            ]);

            return ['request' => $request, 'admin' => $admin];
        });

        if (isset($result['error'])) {
            return $result['error'];
        }

        // Send approval email outside transaction
        try {
            Mail::to($result['request']->email)->send(new RegistrationApproved($result['request']->username));
        } catch (\Exception $e) {
            Log::error('Failed to send approval email', [
                'username' => $result['request']->username,
                'error' => $e->getMessage(),
            ]);
        }

        Log::info('Registration approved', [
            'admin' => $result['admin']->username,
            'username' => $result['request']->username,
            'groups' => $groups,
            'email' => $result['request']->email,
        ]);

        return response()->json(['status' => 'approved']);
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
