<?php namespace Blindern\Intern\Auth;

use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    public function register()
    {
        // you can choose a different name
        \Auth::extend('bsauth', function ($app, $name, array $config) {
            return new Guard($name, new UserProvider(), $this->app['session.store']);
        });
        \Auth::provider('bsauth', function ($app, array $config) {
            return new UserProvider();
        });
    }
}
