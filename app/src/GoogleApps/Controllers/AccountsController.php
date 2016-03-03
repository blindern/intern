<?php namespace Blindern\Intern\GoogleApps\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use Blindern\Intern\Helpers\Flash;
use Blindern\Intern\Helpers\FlashCollection;
use Blindern\Intern\GoogleApps\Models\Account;

class AccountsController extends Controller
{
    public function __construct()
    {
        // don't require auth for local requests
        // TODO: this should be replace with some sort of authorization and tokens...
        if ($_SERVER['REMOTE_ADDR'] !== gethostbyname('athene.foreningenbs.no.')) {
            $this->middleware('auth');
        }
    }

    /**
     * Display a listing of the resource.
     *
     * @return Response
     */
    public function index()
    {
        return Account::orderBy('accountname')->with('users')->get();
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
                $account->restore();
                $account->group = $request->input('group');
                $account->save();
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
     * Display the specified resource.
     *
     * @param  string  $id
     * @return Response
     */
    public function show($id)
    {
        return Account::findOrFail($id);
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
