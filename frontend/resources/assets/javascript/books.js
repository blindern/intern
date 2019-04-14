(function () {
    'use strict';

        var Book = $resource('api/books/:id', {id: '@_id'}, {
        });


    mod.controller('BookRegisterCtrl', function (Page, Book, AuthService, $scope, $http, $location) {
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

        $scope.isbnSearch = function () {
            if (!$scope.book.isbn) return;
            $scope.book.isbn = $scope.book.isbn.replace(/-/g, "");
            $scope.isbn_is_searching = true;
            console.log("search for isbn", $scope.book.isbn);
            $http.post('api/books/isbn', {
                'isbn': $scope.book.isbn
            }).success(function (data) {
                console.log("isbn got data back", data);
                $scope.book = new Book();
                $scope.book.isbn = data.isbn;

                angular.forEach(data.data, function (value, key) {
                    $scope.book[key] = value;
                });

                restoreParams();
                document.getElementById('title').focus();
            }).then(function () {
                $scope.isbn_is_searching = false;
            });
        };

        $scope.addBook = function () {
            $scope.book.$save(function (result) {
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

    mod.controller('BookItemCtrl', function (Page, Book, AuthService, $scope, $routeParams, $location, $injector) {
        console.log("test", getBookOrRedir);
        getBookOrRedir($routeParams.id, $injector).then(function (result) {
            $scope.book = result;
            var handleBarcode = function () {
                $scope.bib_barcode = $scope.book.bib_barcode ? $scope.book.bib_barcode/*.substring(0, $scope.book.bib_barcode.length - 3)*/ : null;

                if (!$scope.book.bib_barcode) {
                    $scope.show_barcode_form = AuthService.inGroup('biblioteksutvalget');
                }
            };
            $scope.$watch('book.bib_barcode', handleBarcode);
            handleBarcode();
        });

        $scope.deleteBook = function () {
            if (confirm("Er du sikker på at du vil slette boka fra databasen?")) {
                $scope.book.$delete(function () {
                    $location.path('books');
                });
            }
        };

        $scope.registerBarcode = function () {
            if ($scope.barcode.substring(0, 3) != "BS-") {
                alert("Ugyldig strekkode for biblioteket.");
            } else {
                $scope.book.setBarcode($scope.barcode);
            }
        };
    });

    mod.controller('BookItemEditCtrl', function (AuthService, $routeParams, $location, $injector) {
        var ctrl = this;
        getBookOrRedir($routeParams.id, $injector).then(function (book) {
            ctrl.book = book;

            if (!AuthService.requireGroup('biblioteksutvalget')) {
                ctrl.noaccess = true;
            }
        });

        ctrl.save = function saveBook() {
            ctrl.book.$update(function () {
                $location.path('books/' + ctrl.book._id);
            }, function (err) {
                alert("Feil ved lagring av bokdata: "+err);
            });
        };

        ctrl.abort = function () {
            $location.path('books/' + ctrl.book._id);
        };
    });

    function getBookOrRedir(id, $injector) {
        $injector.get('Page').setTitle('Laster bok ...');
        return $injector.get('Book').get({'id': id}, function (book) {
            $injector.get('Page').setTitle(book.title + (book.subtitle ? ': ' + book.subtitle : ''));
        }, function () {
            // send to book index on error
            $injector.get('$location').path('books');
        }).$promise;
    }
})();
