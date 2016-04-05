angular.module('controllers', [])
.controller('LandingCtrl', ['$scope', 'SSFConfigConstants', '$state', '$timeout', 'ionicMaterialInk',
      'ionicMaterialMotion', '$ionicHistory', '$window',
      function($scope, SSFConfigConstants, $state, $timeout, ionicMaterialInk,
      ionicMaterialMotion, $ionicHistory, $window) {
    
    
    if($window.localStorage.companyId !== undefined) {
      $state.go('emp-lobby');
    } else if($window.localStorage.userID !== undefined) {
      $state.go('con-lobby');
    } else {
      $state.go('landing');
    }
    $scope.$on('$ionicView.enter', function() {
      $ionicHistory.clearCache();
    });
    $timeout(function(){
      ionicMaterialInk.displayEffect();
      ionicMaterialMotion.ripple();
    },0);
    $scope.registerButton = function() {
      SSFConfigConstants.currentLogin = 'SSFUsers/';
      $state.go('con-register');
    };
}]);