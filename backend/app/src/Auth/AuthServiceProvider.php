<?php namespace Blindern\Intern\Auth;

use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    public function register()
    {
        \Auth::extend('bsauth', function ($app, $name, array $config) {
            $guard = new Guard($name, new UserProvider(), $this->app['session.store']);

            $guard->setCookieJar($this->app['cookie']);
            $guard->setDispatcher($this->app['events']);
            $guard->setRequest($this->app->refresh('request', $guard, 'setRequest'));

            if (isset($config['remember'])) {
                $guard->setRememberDuration($config['remember']);
            }

            return $guard;
        });

        \Auth::provider('bsauth', function ($app, array $config) {
            return new UserProvider();
        });
    }
}
