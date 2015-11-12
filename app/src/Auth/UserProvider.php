<?php namespace Blindern\Intern\Auth;

use Illuminate\Database\Connection;
//use Illuminate\Contracts\Hashing\Hasher;
use Illuminate\Contracts\Auth\Authenticatable as UserContract;
use Illuminate\Contracts\Auth\UserProvider as UserProviderContract;
//use User;

class UserProvider implements UserProviderContract {
	/**
	 * Create a new user provider.
	 *
	 * @return void
	 */
	public function __construct()
	{
		
	}

	/**
	 * Retrieve a user by their unique identifier.
	 *
	 * @param  mixed  $identifier
	 * @return \HenriSt\OpenLdapAuth\LdapUser|null
	 */
	public function retrieveById($identifier)
	{
		return User::find($identifier);
	}

	/**
	 * Retrieve a user by email address
	 *
	 * @param string $email
	 * @return \Blindern\Intern\Auth\User|null
	 */
	public function retrieveByEmail($email)
	{
		return User::findByEmail($email);
	}

	/**
	 * Retrieve a user by by their unique identifier and "remember me" token.
	 *
	 * @param  mixed  $identifier
	 * @param  string  $token
	 * @return \Illuminate\Contracts\Auth\Authenticatable|null
	 */
	public function retrieveByToken($identifier, $token)
	{
		$user = LocalUser::where('username', $identifier)->where(User::REMEMBER_TOKEN, $token)->first();
		if ($user)
		{
			return User::find($user->username);
		}
	}

	/**
	 * Update the "remember me" token for the given user in storage.
	 *
	 * @param  \Illuminate\Contracts\Auth\Authenticatable  $user
	 * @param  string  $token
	 * @return void
	 */
	public function updateRememberToken(UserContract $user, $token)
	{
		$user->setRememberToken($token);
	}

	/**
	 * Retrieve a user by the given credentials.
	 *
	 * @param  array  $credentials
	 * @return \Illuminate\Contracts\Auth\Authenticatable|null
	 */
	public function retrieveByCredentials(array $credentials)
	{
		$user = $this->retrieveById($credentials['username']);
		if (!is_null($user))
		{
			return $user;
		}

		// check if we can match by email
		$user = $this->retrieveByEmail($credentials['username']);
		if (!is_null($user))
		{
			return $user;
		}
	}

	/**
	 * Validate a user against the given credentials.
	 *
	 * @param  \Illuminate\Contracts\Auth\Authenticatable  $user
	 * @param  array  $credentials
	 * @return bool
	 */
	public function validateCredentials(UserContract $user, array $credentials)
	{
		$response = Helper::post('simpleauth', array(
			"username" => $user->username,
			"password" => $credentials['password']
		), false)->contentType('form')->send();

		return isset($response->body['result']);
	}
}