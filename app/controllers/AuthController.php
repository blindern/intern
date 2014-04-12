<?php

class AuthController extends Controller {
	public function get_login() {
		return View::make('auth/login');
	}

	public function post_login() {
		$user = array(
			'username' => Input::get('username'),
			'password' => Input::get('password')
		);

		if (Auth::attempt($user, Input::get('remember_me')))
		{
			return Redirect::to('/user/'.Auth::user()->username);
		}

		return View::make('auth/login');
	}

	public function action_logout() {
		Auth::logout();
		return Redirect::to('/');
	}
}