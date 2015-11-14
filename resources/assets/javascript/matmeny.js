'use strict';

var mod = angular.module('intern.matmeny', [
    'ngRoute',
    'intern.helper.page',
    'intern.auth',
    'angularFileUpload']);

mod.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/matmeny', {
        templateUrl: require('../views/matmeny/index.html'),
        controller: 'MatmenyCtrl'
    });
}]);

mod.controller('MatmenyCtrl', function($scope, $http, AuthService, FileUploader, Matmeny, Page) {
    Page.setTitle('Matmeny');

    $scope.access = AuthService.isOffice() || AuthService.inGroup('kollegiet');
    if (!$scope.access) return;

    // how many previous and comming weeks to show
    var show_prev_weeks = 3;
    var show_next_weeks = 2;


    // build week structure
    var d = moment().startOf('week');
    d.subtract(show_prev_weeks, 'weeks');
    var weeks = {};
    var date_from = d.format('YYYY-MM-DD');
    for (var i = 0; i < show_prev_weeks+show_next_weeks+1; i++) {
        var week = {
            'year': d.format('GGGG'),
            'week': d.format('WW'),
            'relnum': i-show_prev_weeks,
            'start': moment(d),
            'days': {},
            'datacount': 0
        };
        weeks[d.format('GGGG-WW')] = week;
        for (var j = 0; j < 7; j++) {
            week.days[d.format('YYYY-MM-DD')] = {
                day: d.format('YYYY-MM-DD'),
                text: null,
                dishes: null
            };
            d.add(1, 'days');
        }

    }
    d.endOf('week');
    var date_to = d.format('YYYY-MM-DD');

    // get week data
    Matmeny.query({from: date_from, to: date_to}, function(ret) {
        angular.forEach(ret, function(elm) {
            var d = moment(elm.day);
            weeks[d.format('GGGG-WW')].days[elm.day] = elm;
            weeks[d.format('GGGG-WW')].datacount++;
        });
        $scope.weeks = weeks;

        // preferred week
        var d = moment();
        if (d.format('E') > 3) d.add(1, 'week');
        $scope.current_week = d.format('GGGG-WW');
    });

    // uploading of menu
    $scope.uploader = new FileUploader({
        url: 'api/matmeny/convert',
        removeAfterUpload: true
    });
    $scope.uploader.onAfterAddingFile = function(fileItem) {
        var week = $scope.current_week;
        $scope.uploadprogress = true;
        fileItem.onSuccess = function(res) {
            var d = moment(weeks[week].start);
            angular.forEach(res, function(item) {
                weeks[week].days[d.format('YYYY-MM-DD')] = {
                    day: d.format('YYYY-MM-DD'),
                    text: null,
                    dishes: item
                };
                d.add(1, 'day');
            });
            $scope.weeksChanged[week] = true;
            $scope.uploadprogress = null;
        };
        fileItem.onError = function() {
            alert("Ukjent feil ved opplasting og konvertering av dokument.");
        };
        fileItem.upload();
    };

    // elements changed
    $scope.weeksChanged = {};
    $scope.itemChanged = function(day) {
        $scope.weeksChanged[moment(day.day).format('GGGG-WW')] = true;
    };

    // saving changes (for current week only)
    $scope.submitForm = function() {
        $scope.is_submitting = true;
        var week = $scope.current_week;

        Matmeny.storeDays(weeks[week].days).success(function(ret) {
            delete $scope.weeksChanged[week];
            console.log("stored", ret);
        }).error(function(ret) {
            console.log("error", ret);
        }).then(function() {
            $scope.is_submitting = false;
        });
    }
});

mod.factory('Matmeny', function($resource, $http) {
    var r = $resource('api/matmeny', {
        'day': '@day'
    });

    r.storeDays = function(days) {
        return $http.post('api/matmeny', {
            days: days
        });
    };

    return r;
});