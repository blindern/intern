'use strict';

var mod = angular.module('intern.books', ['ngRoute', 'intern.helper.page', 'ngResource']);

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
        })
        .when('/books/:id', {
            templateUrl: 'views/books/book.html',
            controller: 'BookItemCtrl'
        });
}]);

mod.service('Book', function($resource) {
    return $resource('api/books/:id', {id: '@_id'}, {
        query: { method: 'GET', isArray: false }
    });
});

mod.controller('BookHomeCtrl', function(Page, Book, $scope) {
	Page.setTitle('Bokdatabase');

    $scope.currentPage = 1;

    // navigation triggers
    $scope.nextPage = function() {
        if ($scope.currentPage < $scope.totalPages) $scope.currentPage++;
    };
    $scope.prevPage = function() {
        if ($scope.currentPage > 1) $scope.currentPage--;
    };
    $scope.firstPage = function() {
        $scope.currentPage = 1;
    };
    $scope.lastPage = function() {
        $scope.currentPage = $scope.totalPages;
    };
    $scope.setPage = function(n) {
        $scope.currentPage = n;
    };

    function pageChange() {
        Book.query({
            'page': $scope.currentPage
        }, function(data) {
            $scope.books = data.data;
            $scope.currentPage = data.current_page;
            $scope.total = data.total;
            $scope.perPage = data.per_page;
            $scope.totalPages = data.last_page;
            $scope.from = data.from;
            $scope.to = data.to;
        });
    }

    $scope.$watch('currentPage', function(newPage, lastPage) {
        if (newPage != lastPage) {
            pageChange();
        }
    });

    pageChange();
});

mod.controller('BookRegisterCtrl', function(Page, Book, $scope, $http, $location) {
    Page.setTitle('Registrer bok');

    $scope.book = new Book();

    $scope.isbnSearch = function() {
        console.log("search for isbn", $scope.isbn_search);
        $http.post('api/books/isbn', {
            'isbn': $scope.isbn_search
        }).success(function(data) {
            console.log("isbn got data back", data);
            $scope.book = new Book();
            $scope.book.isbn = data.isbn;
            angular.forEach(data.data, function(value, key) {
                $scope.book[key] = value;
            });
            document.getElementById('title').focus();
        });
    };

    $scope.addBook = function() {
        $scope.book.$save(function(result) {
            console.log("book saved?", result);
            if (result._id) {
                $location.path("/books/" + result._id);
            }
        });
    };
});

mod.controller('BookItemCtrl', function(Page, Book, $scope, $routeParams) {
    Page.setTitle("Laster bok..");

    console.log("got id?", $routeParams.id);

    Book.get({'id': $routeParams.id}, function(result) {
        console.log("found book?", result);
        $scope.book = result;
        Page.setTitle(result.title);
    });
});