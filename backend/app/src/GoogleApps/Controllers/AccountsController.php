<?php namespace Blindern\Intern\GoogleApps\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use Blindern\Intern\Auth\User;
use Blindern\Intern\Helpers\Flash;
use Blindern\Intern\Helpers\FlashCollection;
use Blindern\Intern\GoogleApps\Models\Account;

class AccountsController extends Controller
{
    public function __construct()
    {
        // don't require auth for local requests
        // TODO: this should be replace with some sort of authorization and tokens...
        if ($_SERVER['REMOTE_ADDR'] !== '127.0.0.1' && $_SERVER['REMOTE_ADDR'] !== gethostbyname('athene.foreningenbs.no.') && $_SERVER['REMOTE_ADDR'] !== gethostbyname('hsw.no')) {
            $this->middleware('auth');
        }
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
            return Flash::forge('Du har ikke tilgang til denne funksjonen.')->setError()->asResponse(null, 403);
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
            return Flash::forge('Du har ikke tilgang til denne funksjonen.')->setError()->asResponse(null, 403);
        }

        $account = Account::findOrFail($id);

        $account->users()->delete();
        $account->delete();
        return array(
            'deleted' => true
        );
    }
}
