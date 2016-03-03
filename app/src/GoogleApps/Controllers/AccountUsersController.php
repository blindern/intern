<?php namespace Blindern\Intern\GoogleApps\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use Blindern\Intern\Helpers\Flash;
use Blindern\Intern\Helpers\FlashCollection;
use Blindern\Intern\GoogleApps\Models\Account;
use Blindern\Intern\GoogleApps\Models\AccountUser;
use Blindern\Intern\Auth\User;

class AccountUsersController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth.basic');
    }

    /**
     * Display a listing of the resource.
     *
     * @return Response
     */
    public function index()
    {
        return AccountUser::orderBy('username')->with('account')->paginate($limit = 100);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return Response
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'accountname' => 'required',
            'username' => 'required'
        ]);

        if (!\Auth::member('ukestyret')) {
            return Flash::forge('Du har ikke tilgang til denne funksjonen.')->setError()->asResponse(null, 403);
        }

        $account = Account::where('accountname', $request->input('accountname'))->firstOrFail();

        $user = User::find($request->input('username'));
        if (!$user) {
            abort(404);
        }

        // check if it already exists
        $accountuser = $account->users()->withTrashed()->where('username', $user->username)->first();
        if ($accountuser) {
            if ($accountuser->trashed()) {
                $accountuser->restore();
                return $accountuser;
            }

            abort(422, 'Object already exists.');
        }

        $accountuser = new AccountUser();
        $accountuser->username = $user->username;

        $account->users()->save($accountuser);

        return $accountuser;
    }

    /**
     * Display the specified resource.
     *
     * @param  string  $id
     * @return Response
     */
    public function show($id)
    {
        return AccountUser::findOrFail($id);
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

        $accountuser = AccountUser::findOrFail($id);
        $accountuser->delete();
        return array(
            'deleted' => true
        );
    }
}
