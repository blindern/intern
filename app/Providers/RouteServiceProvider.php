<?php namespace App\Providers;

use Illuminate\Routing\Router;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use \Blindern\Intern\Helpers\Flash;
use \Blindern\Intern\Helpers\FlashContainer;
use Auth;
use Redirect;
use Response;
use Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * This namespace is applied to the controller routes in your routes file.
     *
     * In addition, it is set as the URL generator's root namespace.
     *
     * @var string
     */
    protected $namespace = 'App\Http\Controllers';

    /**
     * Define your route model bindings, pattern filters, etc.
     *
     * @param  \Illuminate\Routing\Router  $router
     * @return void
     */
    public function boot(Router $router)
    {
        parent::boot($router);

        Route::after(function ($request, $response) {
            // give access to the phone app testing page
            $response->header('Access-Control-Allow-Origin', 'http://dev1.hsw.no:8000');
        });

        // FIXME: replaced by midleware?
        Route::filter('auth', function () {
            if (Auth::guest()) {
                return Redirect::to('login');
            }
        });

        Route::filter('auth-api', function () {
            if (Auth::guest()) {
                return Response::json(null, 401, (new Flash("Denne siden krever at du logger inn."))->setError()->toHeader());
            }
        });

        Route::filter('auth.basic', function () {
            return Auth::basic();
        });

        /*
        |--------------------------------------------------------------------------
        | Guest Filter
        |--------------------------------------------------------------------------
        |
        | The "guest" filter is the counterpart of the authentication filters as
        | it simply checks that the current user is not logged in. A redirect
        | response will be issued if they are, which you may freely change.
        |
        */

        Route::filter('guest', function () {
            if (Auth::check()) {
                return Redirect::to('/');
            }
        });

        /*
        |--------------------------------------------------------------------------
        | CSRF Protection Filter
        |--------------------------------------------------------------------------
        |
        | The CSRF filter is responsible for protecting your application against
        | cross-site request forgery attacks. If this special token in a user
        | session does not match the one given in this request, we'll bail.
        |
        */

        Route::filter('csrf', function () {
            if (Session::token() != Input::get('_token')) {
                throw new Illuminate\Session\TokenMismatchException;
            }
        });
    }

    /**
     * Define the routes for the application.
     *
     * @param  \Illuminate\Routing\Router  $router
     * @return void
     */
    public function map(Router $router)
    {
        $router->group(['namespace' => $this->namespace], function ($router) {
            require app_path('Http/routes.php');
        });
    }
}
