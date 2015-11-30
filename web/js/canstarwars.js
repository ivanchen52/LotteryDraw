/**
 * Modify by Ivanchen on 11/25/15.
 */

var app = angular.module('AppCandidates', ['ui.bootstrap', 'ngAnimate', 'ngRoute']);


app.controller('CandidatesCtrl', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {

    $scope.candidates = {};
    $scope.error = null;
    $scope.groupId = 1;

    $scope.groupId = $location.search()['groupId'] || '1';

    $scope.init = function() {
        var url = 'api/candidates';

        // TODO: 顯示spin cursor
        //
        $http.get(url)
            .success(function(data, status, header, config) {

                $scope.candidates = data;
                $scope.error = null;

                $scope.$broadcast('candidatesReady', JSON.stringify($scope.candidates));
            })
            .error(function(data, status, header, config) {
                $scope.error = data;
                // TODO: display error
            });
    };

    $scope.refresh = function() {
        $window.location.reload();
    };

    $scope.print = function() {
        $window.print();
    };

    $scope.setGroupId = function(groupId) {
        $scope.groupId = groupId;
    };

    $scope.init();

}])
.directive('candidatesBoard', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            groupId:'='
        },
        templateUrl: 'candidates-board.html',
        controller: function ($scope) {
            $scope.$on('candidatesReady', function(event, msg) {
                $scope.viewData = $scope.convertCandidates(JSON.parse(msg));
                console.log($scope.viewData);
            });

            $scope.flipSound = new buzz.sound('/sound/star_wars',{ formats: ['ogg'], loop:false});

            //依部門別做排序
            function compare(a,b) {
                if (a.depart < b.depart)
                    return -1;
                if (a.depart > b.depart)
                    return 1;
                return 0;
            }

            $scope.convertCandidates = function(candidates) {

                var list = candidates[$scope.groupId] || {};
                //只取可抽大獎者
                list = $.grep(list, function(e){ return e.tags == 'A'; });
                //依部門排序
                list.sort(compare);
console.log(list);
                // list = array of {depart:.., name:..}
                //
                // return {
                //  groupId:
                //  count:
                //  batches :  array of [{depart:.., name:..}], 5 in a batch
                // }
                var ret = {};

                ret.groupId = $scope.groupId;
                ret.count = list.length;
                ret.batches = [];

                var batchSize = 3;
                var batch = [];

                for (var i = 0; i < list.length; i++) {
                    batch.push(list[i]);
                    if (batch.length >= batchSize) {
                        ret.batches.push(batch);
                        batch = [];
                    }
                }
                if (batch.length > 0) {
                    ret.batches.push(batch);  // last chunk
                }
                $scope.flipSound.play();
                return ret;
            };
        }
    };
})

.config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
})
;

function gotoindex()
{

    location.replace("index.html");
}
//滑鼠連點兩下時，回到主頁
document.ondblclick = gotoindex;

