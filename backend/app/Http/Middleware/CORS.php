<?php namespace App\Http\Middleware;

use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Foundation\Http\Events\RequestHandled;
use Closure;

class CORS
{
    /** @var Dispatcher $events */
    protected $events;

    public function __construct(Dispatcher $events)
    {
        $this->events = $events;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $this->events->listen(RequestHandled::class, function (RequestHandled $event) {
            $this->addHeaders($event->request, $event->response);
        });

        /*
        $this->events->listen('kernel.handled', function (\Illuminate\Http\Request $request, \Illuminate\Http\Response $response) {
            $this->addHeaders($request, $response);
        });
        */

        $response = $request->getMethod() === 'OPTIONS'
            ? new \Illuminate\Http\Response()
            : $next($request);

        $this->addHeaders($request, $response);

        return $response;
    }

    protected function addHeaders($request, $response)
    {
        $response->headers->set('Access-Control-Allow-Origin', 'http://localhost:3000');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');
        $response->headers->set('Access-Control-Allow-Headers', 'content-type, x-xsrf-token, x-csrf-token, x-requested-with');
        $response->headers->set('Access-Control-Expose-Headers', 'x-flashes');
    }
}
