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

Route::get('/', 'JsController@index');


// calendar
Route::get('arrplan', 'JsController@index');
Route::get('arrplan/{sem}', 'JsController@index');
Route::get('arrplan.ics', 'KalenderController@action_ics');
Route::get('arrplan.ical', 'KalenderController@action_ics');
Route::get('kalender.ical', 'KalenderController@action_ics');
Route::resource('api/arrplan', "API\\ArrplanController", array('only' => array('index')));

// printer
Route::group(array('before' => 'auth-api'), function()
{
	Route::resource('api/printer/last',      'API\\PrinterLastController',  array('only' => array('index')));
	Route::resource('api/printer/fakturere', "API\\PrinterUsageController", array('only' => array('index')));
});
Route::group(array('before' => 'auth'), function()
{
	Route::get('printer/siste', 'JsController@index');
	Route::get('printer/fakturere', 'JsController@index');
});

// login system
Route::get('login', 'AuthController@get_login');
Route::post('login', 'AuthController@post_login');
Route::get('logout', 'AuthController@action_logout');

// users and groups
Route::group(array('before' => 'auth-api'), function()
{
	Route::resource('api/user', 'API\\UserController', array('only' => array('index', 'show', 'edit')));
	Route::resource('api/group', 'API\\GroupController', array('only' => array('index', 'show')));
});
Route::group(array('before' => 'auth'), function()
{
	Route::get('users', 'JsController@index');
	Route::get('user/{user}', 'JsController@index');

	Route::get('groups', 'JsController@index');
	Route::get('group/{group}', 'JsController@index');
});

// dugnaden
Route::group(array('before' => 'auth-api'), function()
{
	Route::resource('api/dugnaden/old', 'API\\DugnadenOldController', array('only' => array('index')));
});
Route::group(array('before' => 'auth'), function()
{
	Route::get('dugnaden/old/list', 'JsController@index');
});