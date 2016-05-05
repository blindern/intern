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
            GoogleAppsAccount.query({expand: 1}, function (res) {
                $scope.accounts = res;
            });
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
        };

        $scope.updateAccount = function(account, accountname, groupname) {
            if (accountname.trim() !== '' && groupname.trim() !== '') {
                account.accountname = accountname.trim();
                account.group = groupname.trim();
                account.$update(function () {
                    fetchAccounts();
                });
            }
        };

        $scope.addAlias = function(account, alias) {
            account.aliases = account.aliases || [];
            account.aliases.push(alias);
            account.$update(function () {
                fetchAccounts();
            });
        };

        $scope.deleteAlias = function(account, alias) {
            account.aliases = account.aliases || [];
            var index = account.aliases.indexOf(alias);
            if (index !== -1) {
                account.aliases.splice(index, 1);
                account.$update(function () {
                    fetchAccounts();
                });
            }
        };

        $scope.addUser = function(details) {
            if (details.accountname !== undefined && details.username !== undefined) {
                details.accountname = details.accountname.trim();
                details.username = details.username.trim();

                if (details.accountname !== '' && details.username !== '') {
                    var user = new GoogleAppsAccountUser({
                        accountname: details.accountname,
                        username: details.username,
                        notification: details.notification
                    });
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

        $scope.changeNotification = function(user) {
            user.notification = !user.notification;
            GoogleAppsAccountUser.update(user, function (result) {
                fetchAccounts();
            });
        };
    });
})();
