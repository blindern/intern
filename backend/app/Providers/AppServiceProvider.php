<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        setlocale(LC_TIME, 'nb_NO.utf8');
        \Httpful\Httpful::register(\Httpful\Mime::JSON, new \Httpful\Handlers\JsonHandler(array('decode_as_array' => true)));
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
