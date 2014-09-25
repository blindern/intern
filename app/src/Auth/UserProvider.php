<?php namespace Blindern\Intern\Auth;

use Illuminate\Database\Connection;
use Illuminate\Hashing\HasherInterface;
use Illuminate\Auth;

class UserProvider implements Auth\UserProviderInterface {
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
	 * @return \Illuminate\Auth\UserInterface|null
	 */
	public function retrieveByToken($identifier, $token)
	{
		return null;
		/*$user = $this->conn->table($this->table)
                                ->where('id', $identifier)
                                ->where('remember_token', $token)
                                ->first();

		if ( ! is_null($user))
		{
			return new GenericUser((array) $user);
		}*/
	}

	/**
	 * Update the "remember me" token for the given user in storage.
	 *
	 * @param  \Illuminate\Auth\UserInterface  $user
	 * @param  string  $token
	 * @return void
	 */
	public function updateRememberToken(Auth\UserInterface $user, $token)
	{
		/*$this->conn->table($this->table)
                            ->where('id', $user->getAuthIdentifier())
                            ->update(array('remember_token' => $token));*/
	}

	/**
	 * Retrieve a user by the given credentials.
	 *
	 * @param  array  $credentials
	 * @return \Illuminate\Auth\UserInterface|null
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
	 * @param  \Illuminate\Auth\UserInterface  $user
	 * @param  array  $credentials
	 * @return bool
	 */
	public function validateCredentials(Auth\UserInterface $user, array $credentials)
	{
		$response = Helper::post('simpleauth', array(
			"username" => $user->username,
			"password" => $credentials['password']
		), false)->contentType('form')->send();

		return isset($response->body['result']);
	}
}