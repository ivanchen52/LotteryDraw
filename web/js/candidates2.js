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

            //依部門別做排序
            function compare(a,b) {
                if (a.depart < b.depart)
                    return -1;
                if (a.depart > b.depart)
                    return 1;
                return 0;
            }

            $scope.convertCandidates = function(candidates) {
                //timer=setInterval("scrollWin()",10);
                var list = candidates[$scope.groupId] || {};
                list.sort(compare);

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

                var batchSize = 5;
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

                return ret;
            };
        }
    };
})

.config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
})
;

//用來儲存scrollTop的值
var pos;
//用來接setInterval()所回傳的參數用
var timer;
//初始化，設定10豪秒執行一次scrollWin()
function init(){
    timer=setInterval("scrollWin()",10);
}
//停止scrollWin()
function clearScroll(){
    clearInterval(timer);
}
//主要程式
function scrollWin(){
    //把目前的scrollTop指給pos
    pos=document.body.scrollTop;
    //捲軸往下滾動pos+1,往右不變
    window.scroll(0,++pos);
    //若pos不等於scrollTop，表示已達底部，停止scrollWin()
    if (pos != document.body.scrollTop) clearScroll();
}
//滑鼠單點一下時，表示停止scrollWin()
document.onmousedown = clearScroll;
//滑鼠連點兩下時，表示開始執行init()
document.ondblclick = init;



