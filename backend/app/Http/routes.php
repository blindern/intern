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

// books
Route::get('books', 'JsController@index');
Route::get('bokdatabase', 'JsController@index');
Route::get('books/register', 'JsController@index');
Route::get('books/{id}', 'JsController@index');
Route::get('books/{id}/edit', 'JsController@index');
Route::resource('api/books', '\\Blindern\\Intern\\Books\\Controllers\\BookController', array('only' => array('index', 'store', 'show', 'update', 'destroy')));
Route::post('api/books/isbn', '\\Blindern\\Intern\\Books\\Controllers\\BookController@isbn');
Route::post('api/books/{id}/barcode', '\\Blindern\\Intern\\Books\\Controllers\\BookController@barcode');

// bukker
Route::get('bukker', 'JsController@index');
Route::get('bukker/{id}', 'JsController@index');
Route::get('api/bukker/image', '\\Blindern\\Intern\\Bukker\\Controllers\\BukkerController@image');
Route::resource('api/bukker', '\\Blindern\\Intern\\Bukker\\Controllers\\BukkerController');

// calendar
Route::get('arrplan', 'JsController@index');
Route::get('arrplan/{sem}', 'JsController@index');
Route::get('arrplan.ics', '\\Blindern\\Intern\\Arrplan\\Controllers\\ArrplanController@action_ics');
Route::get('arrplan.ical', '\\Blindern\\Intern\\Arrplan\\Controllers\\ArrplanController@action_ics');
Route::get('kalender.ical', '\\Blindern\\Intern\\Arrplan\\Controllers\\ArrplanController@action_ics');
Route::get('api/arrplan/next', '\\Blindern\\Intern\\Arrplan\\Controllers\\ArrplanApiController@next');
Route::resource('api/arrplan', '\\Blindern\\Intern\\Arrplan\\Controllers\\ArrplanApiController', array('only' => array('index')));

// printer
Route::group(['middleware' => 'auth'], function () {
    Route::resource('api/printer/last',      'API\\PrinterLastController',  array('only' => array('index')));
    Route::resource('api/printer/fakturere', "API\\PrinterUsageController", array('only' => array('index')));
});
Route::get('printer/siste', 'JsController@index');
Route::get('printer/fakturere', 'JsController@index');

// login system
Route::get('api/me', 'API\\MeController@index');
Route::get('login', 'JsController@index');
Route::get('register', 'JsController@index');
Route::post('api/register', 'AuthController@register');
Route::post('api/login', 'AuthController@login');
Route::get('logout', 'AuthController@logout');
Route::post('api/logout', 'AuthController@logout');

// users and groups
Route::group(['middleware' => 'auth'], function () {
    Route::resource('api/user', 'API\\UserController', array('only' => array('index', 'show', 'edit')));
    Route::resource('api/group', 'API\\GroupController', array('only' => array('index', 'show')));
});
Route::get('users', 'JsController@index');
Route::get('user/{user}', 'JsController@index');

Route::get('groups', 'JsController@index');
Route::get('group/{group}', 'JsController@index');

// google apps accounts
Route::resource('api/googleapps/accounts', '\\Blindern\\Intern\\GoogleApps\\Controllers\\AccountsController');
Route::resource('api/googleapps/accountusers', '\\Blindern\\Intern\\GoogleApps\\Controllers\\AccountUsersController');
Route::get('googleapps', 'JsController@index');

// dugnaden
Route::group(['middleware' => 'auth'], function () {
    Route::resource('api/dugnaden/old', 'API\\DugnadenOldController', array('only' => array('index')));
});
Route::get('dugnaden/old/list', 'JsController@index');

// matmeny
Route::get('matmeny', 'JsController@index');
Route::get('matmeny/plain', 'MatmenyController@index');
Route::get('matmeny.ics', 'MatmenyController@ics');
Route::get('api/matmeny', 'API\\MatmenyController@index');
Route::post('api/matmeny/convert', 'API\\MatmenyController@convert');
Route::post('api/matmeny', 'API\\MatmenyController@store');
