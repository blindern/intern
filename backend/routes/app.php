<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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

Route::get('/', '\\App\\Http\\Controllers\\JsController@index');

// books
Route::get('books', '\\App\\Http\\Controllers\\JsController@index');
Route::get('bokdatabase', '\\App\\Http\\Controllers\\JsController@index');
Route::get('books/register', '\\App\\Http\\Controllers\\JsController@index');
Route::get('books/{id}', '\\App\\Http\\Controllers\\JsController@index');
Route::get('books/{id}/edit', '\\App\\Http\\Controllers\\JsController@index');
Route::resource('api/books', '\\Blindern\\Intern\\Books\\Controllers\\BookController', array('only' => array('index', 'store', 'show', 'update', 'destroy')));
Route::post('api/books/isbn', '\\Blindern\\Intern\\Books\\Controllers\\BookController@isbn');
Route::post('api/books/{id}/barcode', '\\Blindern\\Intern\\Books\\Controllers\\BookController@barcode');

// bukker
Route::get('bukker', '\\App\\Http\\Controllers\\JsController@index');
Route::get('bukker/{id}', '\\App\\Http\\Controllers\\JsController@index');
Route::get('api/bukker/image', '\\Blindern\\Intern\\Bukker\\Controllers\\BukkerController@image');
Route::resource('api/bukker', '\\Blindern\\Intern\\Bukker\\Controllers\\BukkerController');

// calendar
Route::get('arrplan', '\\App\\Http\\Controllers\\JsController@index');
Route::get('arrplan/{sem}', '\\App\\Http\\Controllers\\JsController@index');
Route::get('arrplan.ics', '\\Blindern\\Intern\\Arrplan\\Controllers\\ArrplanController@action_ics');
Route::get('arrplan.ical', '\\Blindern\\Intern\\Arrplan\\Controllers\\ArrplanController@action_ics');
Route::get('kalender.ical', '\\Blindern\\Intern\\Arrplan\\Controllers\\ArrplanController@action_ics');
Route::get('api/arrplan/next', '\\Blindern\\Intern\\Arrplan\\Controllers\\ArrplanApiController@next');
Route::resource('api/arrplan', '\\Blindern\\Intern\\Arrplan\\Controllers\\ArrplanApiController', array('only' => array('index')));

// printer
Route::group(['middleware' => 'auth'], function () {
    Route::resource('api/printer/last',      '\\App\\Http\\Controllers\\API\\PrinterLastController',  array('only' => array('index')));
    Route::resource('api/printer/fakturere', "\\App\\Http\\Controllers\\API\\PrinterUsageController", array('only' => array('index')));
});
Route::get('printer/siste', '\\App\\Http\\Controllers\\JsController@index');
Route::get('printer/fakturere', '\\App\\Http\\Controllers\\JsController@index');

// login system
Route::get('api/me', '\\App\\Http\\Controllers\\API\\MeController@index');
Route::get('login', '\\App\\Http\\Controllers\\JsController@index');
Route::get('register', '\\App\\Http\\Controllers\\JsController@index');
Route::post('api/register', '\\App\\Http\\Controllers\\AuthController@register');
Route::post('api/login', '\\App\\Http\\Controllers\\AuthController@login');
Route::get('logout', '\\App\\Http\\Controllers\\AuthController@logout');
Route::post('api/logout', '\\App\\Http\\Controllers\\AuthController@logout');

// users and groups
Route::group(['middleware' => 'auth'], function () {
    Route::resource('api/user', '\\App\\Http\\Controllers\\API\\UserController', array('only' => array('index', 'show', 'edit')));
    Route::resource('api/group', '\\App\\Http\\Controllers\\API\\GroupController', array('only' => array('index', 'show')));
});
Route::get('users', '\\App\\Http\\Controllers\\JsController@index');
Route::get('user/{user}', '\\App\\Http\\Controllers\\JsController@index');

Route::get('groups', '\\App\\Http\\Controllers\\JsController@index');
Route::get('group/{group}', '\\App\\Http\\Controllers\\JsController@index');

// google apps accounts
Route::resource('api/googleapps/accounts', '\\Blindern\\Intern\\GoogleApps\\Controllers\\AccountsController');
Route::resource('api/googleapps/accountusers', '\\Blindern\\Intern\\GoogleApps\\Controllers\\AccountUsersController');
Route::get('googleapps', '\\App\\Http\\Controllers\\JsController@index');

// dugnaden
Route::group(['middleware' => 'auth'], function () {
    Route::resource('api/dugnaden/old', '\\App\\Http\\Controllers\\API\\DugnadenOldController', array('only' => array('index')));
});
Route::get('dugnaden/old/list', '\\App\\Http\\Controllers\\JsController@index');

// matmeny
Route::get('matmeny', '\\App\\Http\\Controllers\\JsController@index');
Route::get('matmeny/plain', '\\App\\Http\\Controllers\\MatmenyController@index');
Route::get('matmeny.ics', '\\App\\Http\\Controllers\\MatmenyController@ics');
Route::get('api/matmeny', '\\App\\Http\\Controllers\\API\\MatmenyController@index');
Route::post('api/matmeny/convert', '\\App\\Http\\Controllers\\API\\MatmenyController@convert');
Route::post('api/matmeny', '\\App\\Http\\Controllers\\API\\MatmenyController@store');
