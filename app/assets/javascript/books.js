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

mod.service('Book', function($resource, $http) {
    var Book = $resource('api/books/:id', {id: '@_id'}, {
        query: { method: 'GET', isArray: false }
    });

    Book.prototype.setBarcode = function(barcode) {
        var self = this;
        return $http.post('api/books/'+this._id+'/barcode', {
            'barcode': barcode
        }).success(function() {
            self.bib_barcode = barcode;
        });
    };

    return Book;
});

mod.controller('BookHomeCtrl', function(Page, Book, $scope) {
	Page.setTitle('Biblioteket på Blindern Studenterhjem');

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

mod.controller('BookRegisterCtrl', function(Page, Book, AuthService, $scope, $http, $location) {
    Page.setTitle('Registrer bok');

    if (!AuthService.requireGroup('biblioteksutvalget')) {
        $scope.noaccess = true;
        return;
    }

    $scope.addmore = true;
    $scope.book = new Book();

    // restore last used parameters
    function restoreParams() {
        $scope.book.bib_room = sessionStorage.bookRoom || 'Biblioteket';
        $scope.book.bib_section = sessionStorage.bookSection || '';
    }
    restoreParams();

    $scope.isbnSearch = function() {
        if (!$scope.book.isbn) return;
        $scope.book.isbn = $scope.book.isbn.replace(/-/g, "");
        $scope.isbn_is_searching = true;
        console.log("search for isbn", $scope.book.isbn);
        $http.post('api/books/isbn', {
            'isbn': $scope.book.isbn
        }).success(function(data) {
            console.log("isbn got data back", data);
            $scope.book = new Book();
            $scope.book.isbn = data.isbn;

            angular.forEach(data.data, function(value, key) {
                $scope.book[key] = value;
            });

            restoreParams();
            document.getElementById('title').focus();
        }).then(function() {
            $scope.isbn_is_searching = false;
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

    $scope.syncMeta = function () {
        // save some parameters for later usage
        sessionStorage.bookRoom = $scope.book.bib_room;
        sessionStorage.bookSection = $scope.book.bib_section;
    };
});

mod.controller('BookItemCtrl', function(Page, Book, AuthService, $scope, $routeParams, $location) {
    Page.setTitle("Laster bok..");

    Book.get({'id': $routeParams.id}, function(result) {
        $scope.book = result;
        Page.setTitle(result.title + (result.subtitle ? ': ' + result.subtitle : ''));

        var handleBarcode = function() {
            $scope.bib_barcode = $scope.book.bib_barcode ? $scope.book.bib_barcode/*.substring(0, $scope.book.bib_barcode.length - 3)*/ : null;

            if (!$scope.book.bib_barcode) {
                $scope.show_barcode_form = AuthService.inGroup('biblioteksutvalget');
            }
        };
        $scope.$watch('book.bib_barcode', handleBarcode);
        handleBarcode();
    }, function() {
        // send to book index on error
        $location.path('books');
    });

    $scope.deleteBook = function() {
        if (confirm("Er du sikker på at du vil slette boka fra databasen?")) {
            $scope.book.$delete(function() {
                $location.path('books');
            });
        }
    };

    $scope.editBook = function() {
        // TODO
        alert("Uferdig funksjon!");
    }

    $scope.registerBarcode = function() {
        if ($scope.barcode.substring(0, 3) != "BS-") {
            alert("Ugyldig strekkode for biblioteket.");
        } else {
            $scope.book.setBarcode($scope.barcode);
        }
    };
});