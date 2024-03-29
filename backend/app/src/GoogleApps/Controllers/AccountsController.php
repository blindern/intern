<?php namespace Blindern\Intern\GoogleApps\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use Blindern\Intern\Auth\User;
use Blindern\Intern\GoogleApps\Models\Account;
use Blindern\Intern\Responses;

class AccountsController extends Controller
{
    public function __construct()
    {
        // Allow our simplesamlphp to use a Authorization header.
        if (isset($_ENV['ACCOUNTS_URL_AUTH_TOKEN'])) {
            $token = $_ENV['ACCOUNTS_URL_AUTH_TOKEN'];
            $headers = apache_request_headers();
            if (isset($headers['Authorization']) && $headers['Authorization'] == 'Bearer ' . $token) {
                // No further auth needed.
                return;
            }
        }

        $this->middleware('auth');
    }

    /**
     * Display a listing of the resource.
     *
     * @return Response
     */
    public function index(Request $request)
    {
        $accounts = Account::orderBy('accountname')->with('users')->get();

        if ($request->input('expand')) {
            // retrieve a list of all users
            // so we can fill in email and other details
            $users = array();
            foreach (User::all() as $user) {
                $users[strtolower($user->username)] = $user;
            }

            foreach ($accounts as &$account) {
                foreach ($account->users as &$accountuser) {
                    if (isset($users[strtolower($accountuser->username)])) {
                        $user = $users[strtolower($accountuser->username)];
                        $accountuser->email = $user->email;
                        $accountuser->realname = $user->realname;
                    }
                }
            }
        }

        return $accounts;
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return Response
     */
    public function store(Request $request)
    {
        if (!\Auth::member('ukestyret')) {
            return Responses::forbidden(['Du har ikke tilgang til denne funksjonen.']);
        }

        $this->validate($request, [
            'accountname' => 'required|max:40',
            'group' => 'required'
        ]);

        $account = Account::withTrashed()->where('accountname', $request->input('accountname'))->first();
        if ($account) {
            if ($account->trashed()) {
                $account->group = $request->input('group');
                $account->restore();
                return $account;
            }

            abort(422, 'Object already exists.');
        }

        $account = new Account();
        $account->accountname = $request->input('accountname');
        $account->group = $request->input('group');
        $account->save();

        return $account;
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function update($id, Request $request)
    {
        $account = Account::with('users')->findOrFail($id);

        $this->validate($request, [
            'accountname' => 'required|max:40',
            'aliases' => 'array',
            'group' => 'required'
        ]);

        $account->accountname = $request->input('accountname');
        $account->aliases = $request->input('aliases');
        $account->group = $request->input('group');
        $account->save();

        return $account;
    }

    /**
     * Display the specified resource.
     *
     * @param  string  $id
     * @return Response
     */
    public function show($id)
    {
        return Account::with('users')->findOrFail($id);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function destroy($id)
    {
        if (!\Auth::member("ukestyret")) {
            return Responses::forbidden(['Du har ikke tilgang til denne funksjonen.']);
        }

        $account = Account::findOrFail($id);

        $account->users()->delete();
        $account->delete();
        return array(
            'deleted' => true
        );
    }
}
