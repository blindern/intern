'use strict';

var mod = angular.module('intern.books', ['ngRoute', 'intern.helper.page']);

mod.config(['$routeProvider', function($routeProvider) {
	$routeProvider
        .when('/bokdatabase', {
            templateUrl: 'views/books/index.html',
            controller: 'BookHomeCtrl'
        })
        .when('/books', {
            templateUrl: 'views/books/index.html',
            controller: 'BookHomeCtrl'
        })
        .when('/books/register', {
            templateUrl: 'views/books/register.html',
            controller: 'BookRegisterCtrl'
        });
}])

mod.controller('BookHomeCtrl', function(Page) {
	Page.setTitle('Bokdatabase');
})

mod.controller('BookRegisterCtrl', function(Page, $scope, $http) {
    Page.setTitle('Registrer bok');

    $scope.isbnSearch = function() {
        console.log("search for isbn", $scope.isbn_search);
        $http.post('api/books/isbn', {
            'isbn': $scope.isbn_search
        }).success(function(data, status) {
            console.log("isbn got data back", data, status);
        });
    };
});