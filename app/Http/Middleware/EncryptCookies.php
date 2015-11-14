<?php namespace App\Http\Middleware;

// hack taken from https://laracasts.com/discuss/channels/laravel/cookie-encryption-issue-after-upgrading
// should probably be removed after some times
// issue being resolved: change in cookie encryption gives error instead of just ignoring the cookie

use Illuminate\Cookie\Middleware\EncryptCookies as EncryptCookiesParent;

class EncryptCookies extends EncryptCookiesParent
{
    protected function decrypt(\Symfony\Component\HttpFoundation\Request $request)
    {
        foreach ($request->cookies as $key => $c) {
            if ($this->isDisabled($key)) {
                continue;
            }

            try {
                $request->cookies->set($key, $this->decryptCookie($c));
            } catch (\Exception $e) {
                $request->cookies->set($key, null);
            }
        }

        return $request;
    }
}
