(function () {
    'use strict';

        var Book = $resource('api/books/:id', {id: '@_id'}, {
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
