<?php namespace API;

class UserController extends \Controller {
	public function exceptFields($user = null)
	{
		// begrense felter?
		$except = array();
		$access = \Auth::member("useradmin") || \Auth::member("kollegiet") || \Auth::member("dugnaden") || \Auth::member('foreningsstyret');
		if ((!$user || !\Auth::user()->isSame($user)) && !$access)
		{
			//$except[] = 'phone'; // TODO: not implemented
			$except[] = 'email';
		}

		return $except;
	}

	public function index()
	{
		$ret = array();
		$users = \User::all(true);
		foreach ($users as $user)
		{
			$ret[] = $user->toArray($this->exceptFields($user));
		}

		return $ret;
	}

	public function show($username)
	{
		$user = \User::find($username);
		$user->groups();

		return $user->toArray($this->exceptFields($user));
	}

	// return View::make('auth/noaccess', array("group" => "beboer"));
}
