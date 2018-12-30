(function () {
    'use strict';

    var mod = angular.module('intern.bukker', ['ngRoute', 'intern.helper.page', 'ngResource']);

    mod.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/bukker', {
                templateUrl: require('../views/bukker/index.html'),
                controller: 'BukkerHomeCtrl'
            })
            .when('/bukker/:id', {
                templateUrl: require('../views/bukker/bukk.html'),
                controller: 'BukkerItemCtrl'
            });
    }]);

    mod.service('Bukk', function ($resource, $http) {
        var Bukk = $resource('api/bukker/:id', {id: '@_id'}, {
            query: {method: 'GET', isArray: true},
            update: {method: 'PUT'}
        });

        return Bukk;
    });

    mod.controller('BukkerHomeCtrl', function (Page, Bukk, $scope) {
        Page.setTitle('Bukker');
        Bukk.query({}, function (res) {
            $scope.bukker = res.map(function (bukk) {
                bukk.sortKey = (bukk.awards || []).reduce(function (prev, cur) {
                    if (cur.year > prev.year) {
                        return {
                            year: cur.year,
                            key: cur.year + cur.rank + bukk.name
                        };
                    } else {
                        return prev;
                    }
                }, {
                    year: 0,
                    key: 0
                }).key;

                bukk.thumb = (bukk.awards || [])
                    .sort((a, b) => a - b)
                    .filter(award => award.image_preview_url)
                    .map(award => award.image_preview_url)
                    .pop();

                return bukk;
            });

            // litt statistikk
            $scope.countHalvOnly = 0;
            $scope.countHalvAll = 0;
            $scope.countHelOnly = 0;
            $scope.countHelAll = 0;
            $scope.countHoy = 0;
            $scope.bukker.forEach(bukk => {
                let hoy = bukk.awards.some(award => award.rank === 'Høy');
                let hel = bukk.awards.some(award => award.rank === 'Hel');
                let halv = bukk.awards.some(award => award.rank === 'Halv');

                if (hoy) {
                    $scope.countHoy++;
                }

                if (hel) {
                    $scope.countHelAll++;
                    if (!hoy) {
                        $scope.countHelOnly++;
                    }
                }

                if (halv) {
                    $scope.countHalvAll++;
                    if (!hoy && !hel) {
                        $scope.countHalvOnly++;
                    }
                }
            })
        });

        console.log($scope.bukker)
    });

    mod.controller('BukkerItemCtrl', function (Page, Bukk, $scope, $injector, $routeParams) {
        getBukkOrRedir($routeParams.id, $injector).then(function (result) {
            $scope.bukk = result;
        });
    });

    function getBukkOrRedir(id, $injector) {
        $injector.get('Page').setTitle('Henter data ...');
        return $injector.get('Bukk').get({'id': id}, function (bukk) {
            $injector.get('Page').setTitle(bukk.name);
        }, function () {
            $injector.get('$location').path('bukker');
        }).$promise;
    }
})();
