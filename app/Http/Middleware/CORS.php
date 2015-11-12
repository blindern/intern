<?php namespace App\Http\Middleware;

use Closure;

class CORS
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $response = $next($request);

        // give access to the phone app testing page
        $response->header('Access-Control-Allow-Origin', 'http://dev1.hsw.no:8000');

        return $response;
    }
}
