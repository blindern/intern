require('angular-filter');

(function () {
    'use strict';

    var mod = angular.module('intern.googleapps', ['ngRoute', 'intern.helper.page', 'ngResource', 'angular.filter']);

    mod.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/googleapps', {
                templateUrl: require('../views/googleapps/index.html'),
                controller: 'GoogleAppsCtrl'
            });
    }]);

    mod.service('GoogleAppsAccount', function ($resource) {
        return $resource('api/googleapps/accounts/:id', {
            id: '@_id'
        }, {
            query: {method: 'GET', isArray: true},
            update: {method: 'PUT'}
        });
    });

    mod.service('GoogleAppsAccountUser', function ($resource) {
        return $resource('api/googleapps/accountusers/:id', {
            id: '@_id'
        }, {
            query: {method: 'GET', isArray: true},
            update: {method: 'PUT'}
        });
    });

    mod.controller('GoogleAppsCtrl', function (Page, GoogleAppsAccount, GoogleAppsAccountUser, AuthService, $scope) {
        Page.setTitle('Google Apps');

        $scope.canEdit = AuthService.inGroup('ukestyret');

        function fetchAccounts() {
            $scope.accounts = GoogleAppsAccount.query();
        }
        fetchAccounts();

        function initAccount() {
            $scope.newAccount = new GoogleAppsAccount();
            $scope.newAccount.accountname = '';
        }
        initAccount();

        $scope.createAccount = function() {
            $scope.newAccount.accountname = $scope.newAccount.accountname.trim();
            if ($scope.newAccount.accountname !== '') {
                $scope.newAccount.$save(function (result) {
                    initAccount();
                    fetchAccounts();
                });
            }
        };

        $scope.deleteAccount = function(accountId) {
            GoogleAppsAccount.delete({id: accountId}, function () {
                fetchAccounts();
            });
        }

        $scope.addUser = function(accountname, username) {
            if (accountname !== undefined && username !== undefined) {
                accountname = accountname.trim();
                username = username.trim();

                if (accountname !== '' && username !== '') {
                    var user = new GoogleAppsAccountUser({accountname: accountname, username: username});
                    user.$save(function (result) {
                        fetchAccounts();
                    });
                }
            }
        };

        $scope.deleteUser = function(userId) {
            GoogleAppsAccountUser.delete({id: userId}, function () {
                fetchAccounts();
            });
        };
    });
})();
