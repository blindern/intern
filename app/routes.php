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

$bb = function()
{
	return View::make('layout');
};

Route::get('/', $bb);


// calendar
Route::get('arrplan', $bb);
Route::get('arrplan/{sem}', $bb);
Route::get('arrplan.ics', 'KalenderController@action_ics');
Route::get('arrplan.ical', 'KalenderController@action_ics');
Route::get('kalender.ical', 'KalenderController@action_ics');
Route::resource('api/arrplan', "API\\ArrplanController", array('only' => array('index')));

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

// users and groups
Route::group(array('before' => 'auth'), function()
{
	$bb = function()
	{
		return View::make('layout');
	};

	Route::resource('api/user', 'API\\UserController', array('only' => array('index', 'show', 'edit')));
	Route::get('users', $bb);
	Route::get('user/{user}', $bb);

	Route::resource('api/group', 'API\\GroupController', array('only' => array('index', 'show')));
	Route::get('groups', $bb);
	Route::get('group/{group}', $bb);
});

// dugnaden
Route::group(array('before' => 'auth'), function()
{
	$bb = function()
	{
		return View::make('layout');
	};

	Route::get('dugnaden/old/list', $bb);
	Route::resource('api/dugnaden/old', 'API\\DugnadenOldController', array('only' => array('index')));
});