<?php namespace Blindern\Intern\Auth;

use Illuminate\Support\Manager;
use Illuminate\Contracts\Auth\Guard as GuardContract;

class AuthManager extends Manager
{
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
        if (method_exists($guard, 'setCookieJar')) {
            $guard->setCookieJar($this->app['cookie']);
        }

        if (method_exists($guard, 'setDispatcher')) {
            $guard->setDispatcher($this->app['events']);
        }

        if (method_exists($guard, 'setRequest')) {
            $guard->setRequest($this->app->refresh('request', $guard, 'setRequest'));
        }

        return $guard;
    }

    /**
     * Call a custom driver creator.
     *
     * @param  string  $driver
     * @return \Illuminate\Contracts\Auth\Guard
     */
    protected function callCustomCreator($driver)
    {
        $custom = parent::callCustomCreator($driver);

        if ($custom instanceof GuardContract) {
            return $custom;
        }
        
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

    /**
     * Set the default authentication driver name.
     *
     * @param  string  $name
     * @return void
     */
    public function setDefaultDriver($name)
    {
        $this->app['config']['auth.driver'] = $name;
    }
}
