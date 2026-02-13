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
use \App\Http\Controllers\ChangePasswordController;
use \App\Http\Controllers\PasswordResetController;
use \App\Http\Controllers\MatmenyController as MatmenyPlainController;
use \App\Http\Controllers\API\RegistrationRequestController;
use Blindern\Intern\Saml2\Saml2Controller;
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

    // auth system
    Route::get('me', [MeController::class, 'index']);
    Route::post('register', [AuthController::class, 'register']);

    // password reset (public, rate limited per IP)
    Route::middleware('throttle:5,1')->group(function () {
        Route::post('password-reset/request', [PasswordResetController::class, 'requestReset']);
        Route::post('password-reset/validate', [PasswordResetController::class, 'validateToken']);
        Route::post('password-reset/reset', [PasswordResetController::class, 'resetPassword']);
    });

    // saml2 login
    Route::get('saml2/metadata', [Saml2Controller::class, 'metadata'])->name('saml2.metadata');
    Route::post('saml2/acs', [Saml2Controller::class, 'acs'])->name('saml2.acs');
    Route::get('saml2/sls', [Saml2Controller::class, 'sls'])->name('saml2.sls');
    Route::get('saml2/login', [Saml2Controller::class, 'login'])->name('saml2.login');
    Route::post('saml2/logout', [Saml2Controller::class, 'logout'])->name('saml2.logout');

    // users and groups
    Route::group(['middleware' => 'auth'], function () {
        Route::resource('user', UserController::class, array('only' => array('index', 'show', 'edit')));
        Route::resource('group', GroupController::class, array('only' => array('index', 'show')));

        // change password (logged-in user)
        Route::post('change-password', [ChangePasswordController::class, 'change']);

        // registration request management (useradmin)
        Route::get('registration-requests', [RegistrationRequestController::class, 'index']);
        Route::post('registration-requests/{id}/approve', [RegistrationRequestController::class, 'approve']);
        Route::post('registration-requests/{id}/reject', [RegistrationRequestController::class, 'reject']);
    });

    // google apps accounts
    Route::resource('googleapps/accounts', AccountsController::class);
    Route::resource('googleapps/accountusers', AccountUsersController::class);

    // dugnaden
    Route::group(['middleware' => 'auth'], function () {
        Route::resource('dugnaden/old', DugnadenOldController::class, array('only' => array('index')));
    });

    // matmeny
    Route::get('matmeny/plain', [MatmenyPlainController::class, 'index']);
    Route::get('matmeny.ics', [MatmenyPlainController::class, 'ics']);
    Route::get('matmeny', [MatmenyController::class, 'index']);
    Route::post('matmeny/convert', [MatmenyController::class, 'convert']);
    Route::post('matmeny', [MatmenyController::class, 'store']);
});
