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
Route::get('arrplan', 'KalenderController@action_index');
Route::get('arrplan.ics', 'KalenderController@action_ics');
Route::get('arrplan.ical', 'KalenderController@action_ics');
Route::get('kalender.ical', 'KalenderController@action_ics');

// printer
Route::group(array('before' => 'auth'), function()
{
	$bb = function()
	{
		return View::make('layout');
	};
	
	Route::resource('api/printer/last',      'API\\PrinterLastController',  array('only' => array('index')));
	Route::get('printer/siste', $bb);

	Route::resource('api/printer/fakturere', "API\\PrinterUsageController", array('only' => array('index')));
	Route::get('printer/fakturere', $bb);
});

// login system
Route::get('login', 'AuthController@get_login');
Route::post('login', 'AuthController@post_login');
Route::get('logout', 'AuthController@action_logout');

Route::get('userlist', 'UsersController@action_userlist')->before('auth');// users and groups
Route::group(array('before' => 'auth'), function()
{
	$bb = function()
	{
		return View::make('layout');
	};

	Route::get('profile', $bb);
});