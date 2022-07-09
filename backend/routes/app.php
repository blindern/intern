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

// books
Route::resource('api/books', '\\Blindern\\Intern\\Books\\Controllers\\BookController', array('only' => array('index', 'store', 'show', 'update', 'destroy')));
Route::post('api/books/isbn', '\\Blindern\\Intern\\Books\\Controllers\\BookController@isbn');
Route::post('api/books/{id}/barcode', '\\Blindern\\Intern\\Books\\Controllers\\BookController@barcode');

// bukker
Route::get('api/bukker/image', '\\Blindern\\Intern\\Bukker\\Controllers\\BukkerController@image');
Route::resource('api/bukker', '\\Blindern\\Intern\\Bukker\\Controllers\\BukkerController');

// calendar
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

// login system
Route::get('api/me', '\\App\\Http\\Controllers\\API\\MeController@index');
Route::post('api/register', '\\App\\Http\\Controllers\\AuthController@register');
Route::post('api/login', '\\App\\Http\\Controllers\\AuthController@login');
Route::get('logout', '\\App\\Http\\Controllers\\AuthController@logout');
Route::post('api/logout', '\\App\\Http\\Controllers\\AuthController@logout');

// users and groups
Route::group(['middleware' => 'auth'], function () {
    Route::resource('api/user', '\\App\\Http\\Controllers\\API\\UserController', array('only' => array('index', 'show', 'edit')));
    Route::resource('api/group', '\\App\\Http\\Controllers\\API\\GroupController', array('only' => array('index', 'show')));
});

// google apps accounts
Route::resource('api/googleapps/accounts', '\\Blindern\\Intern\\GoogleApps\\Controllers\\AccountsController');
Route::resource('api/googleapps/accountusers', '\\Blindern\\Intern\\GoogleApps\\Controllers\\AccountUsersController');

// dugnaden
Route::group(['middleware' => 'auth'], function () {
    Route::resource('api/dugnaden/old', '\\App\\Http\\Controllers\\API\\DugnadenOldController', array('only' => array('index')));
});

// matmeny
Route::get('matmeny/plain', '\\App\\Http\\Controllers\\MatmenyController@index');
Route::get('matmeny.ics', '\\App\\Http\\Controllers\\MatmenyController@ics');
Route::get('api/matmeny', '\\App\\Http\\Controllers\\API\\MatmenyController@index');
Route::post('api/matmeny/convert', '\\App\\Http\\Controllers\\API\\MatmenyController@convert');
Route::post('api/matmeny', '\\App\\Http\\Controllers\\API\\MatmenyController@store');
