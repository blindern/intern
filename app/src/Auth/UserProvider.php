<?php namespace Blindern\Intern\Auth;

use Illuminate\Database\Connection;
use Illuminate\Hashing\HasherInterface;
use Illuminate\Auth;
use Httpful\Request;

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
	 * Retrieve a user by the given credentials.
	 *
	 * @param  array  $credentials
	 * @return \Illuminate\Auth\UserInterface|null
	 */
	public function retrieveByCredentials(array $credentials)
	{
		// TODO: check by other credentials

		$user = $this->retrieveById($credentials['username']);
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
		$response = Request::post(Helper::uri('simpleauth'), http_build_query(array(
			"username" => $credentials['username'],
			"password" => $credentials['password']
		)))->contentType('form')->send();

		return isset($response->body['result']);
	}

}