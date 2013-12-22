<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/

Route::get('/', function()
{
	return View::make('index');
});


// calendar
Route::get('kalender', 'KalenderController@action_index');
Route::get('kalender.ical', 'KalenderController@action_ical');

// printer
Route::get('printer/siste', 'PrinterController@action_last')->before('auth');

// login system
Route::get('login', 'AuthController@get_login');
Route::post('login', 'AuthController@post_login');
Route::get('logout', 'AuthController@action_logout');

// users
Route::get('profile', 'AuthController@action_profile')->before('auth');
Route::get('userlist', 'UsersController@action_userlist')->before('auth');