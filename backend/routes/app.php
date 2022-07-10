<?php

use Illuminate\Support\Facades\Route;

use \Blindern\Intern\Arrplan\Controllers\ArrplanApiController;
use \Blindern\Intern\Arrplan\Controllers\ArrplanController;
use \Blindern\Intern\Books\Controllers\BookController;
use \Blindern\Intern\Bukker\Controllers\BukkerController;
use \App\Http\Controllers\API\DugnadenOldController;
use \App\Http\Controllers\API\MatmenyController;
use \App\Http\Controllers\API\MeController;
use \App\Http\Controllers\API\GroupController;
use \App\Http\Controllers\API\UserController;
use \App\Http\Controllers\API\PrinterLastController;
use \App\Http\Controllers\API\PrinterUsageController;
use \App\Http\Controllers\AuthController;
use \Blindern\Intern\GoogleApps\Controllers\AccountsController;
use \Blindern\Intern\GoogleApps\Controllers\AccountUsersController;

Route::prefix('intern/api')->group(function () {
    // books
    Route::resource('books', BookController::class, array('only' => array('index', 'store', 'show', 'update', 'destroy')));
    Route::post('books/isbn', [BookController::class, 'isbn']);
    Route::post('books/{id}/barcode', [BookController::class, 'barcode']);

    // bukker
    Route::resource('bukker', BukkerController::class);
    Route::get('bukker/image', [BukkerController::class, 'image']);

    // calendar
    // TODO: add redirect for old URLs that was not under api
    Route::get('arrplan.ics', [ArrplanController::class, 'ics']);
    Route::get('arrplan.ical', [ArrplanController::class, 'ics']);
    Route::get('kalender.ical', [ArrplanController::class, 'ics']);
    Route::get('arrplan/next', [ArrplanApiController::class, 'next']);
    Route::get('arrplan', [ArrplanApiController::class, 'index']);

    // printer
    Route::group(['middleware' => 'auth'], function () {
        Route::resource('printer/last', PrinterLastController::class,  array('only' => array('index')));
        Route::resource('printer/fakturere', PrinterUsageController::class, array('only' => array('index')));
    });

    // login system
    Route::get('me', [MeController::class, 'index']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout']);

    // users and groups
    Route::group(['middleware' => 'auth'], function () {
        Route::resource('user', UserController::class, array('only' => array('index', 'show', 'edit')));
        Route::resource('group', GroupController::class, array('only' => array('index', 'show')));
    });

    // google apps accounts
    Route::resource('googleapps/accounts', AccountsController::class);
    Route::resource('googleapps/accountusers', AccountUsersController::class);

    // dugnaden
    Route::group(['middleware' => 'auth'], function () {
        Route::resource('dugnaden/old', DugnadenOldController::class, array('only' => array('index')));
    });

    // matmeny
    // TODO: add redirect for old URLs that was not under api
    Route::get('matmeny/plain', [MatmenyController::class, 'index']);
    Route::get('matmeny.ics', [MatmenyController::class, 'ics']);
    Route::get('matmeny', [MatmenyController::class, 'index']);
    Route::post('matmeny/convert', [MatmenyController::class, 'convert']);
    Route::post('matmeny', [MatmenyController::class, 'store']);
});
