<?php namespace Blindern\Intern\Auth;

use Illuminate\Support\Manager;
#use Illuminate\Auth\Guard;

class AuthManager extends Manager {

	/**
	 * Create a new driver instance.
	 *
	 * @param  string  $driver
	 * @return mixed
	 */
	protected function createDriver($driver)
	{
		$guard = parent::createDriver($driver);

		// When using the remember me functionality of the authentication services we
		// will need to be set the encryption instance of the guard, which allows
		// secure, encrypted cookie values to get generated for those cookies.
		$guard->setCookieJar($this->app['cookie']);

		$guard->setDispatcher($this->app['events']);

		return $guard->setRequest($this->app->refresh('request', $guard, 'setRequest'));
	}

	/**
	 * Call a custom driver creator.
	 *
	 * @param  string  $driver
	 * @return mixed
	 */
	protected function callCustomCreator($driver)
	{
		$custom = parent::callCustomCreator($driver);

		if ($custom instanceof Guard) return $custom;

		return new Guard($custom, $this->app['session.store']);
	}

	/**
	 * Create an instance of the database driver.
	 *
	 * @return \Illuminate\Auth\Guard
	 */
	public function createBsauthDriver()
	{
		$provider = $this->createBsauthProvider();

		return new Guard($provider, $this->app['session.store']);
	}

	/**
	 * Create an instance of the database user provider.
	 *
	 * @return \HenriSt\OpenLdapAuth\UserProvider
	 */
	protected function createBsauthProvider()
	{
		return new UserProvider();
	}

	/**
	 * Get the default authentication driver name.
	 *
	 * @return string
	 */
	public function getDefaultDriver()
	{
		return $this->app['config']['auth.driver'];
	}

}