angular.module('controllers', [])
.controller('LandingCtrl', ['$scope', 'SSFConfigConstants', '$state', '$timeout', 'ionicMaterialInk',
      'ionicMaterialMotion', '$ionicHistory',
      function($scope, SSFConfigConstants, $state, $timeout, ionicMaterialInk,
      ionicMaterialMotion, $ionicHistory) {
  
    $scope.$on('$ionicView.enter', function() {
      $ionicHistory.clearCache();
    });
    $timeout(function(){
      ionicMaterialInk.displayEffect();
      ionicMaterialMotion.ripple();
    },0);
    $scope.loginButton = function(whichLogin) {
      SSFConfigConstants.currentLogin = whichLogin;
      $state.go('login');
    };
    $scope.registerButton = function() {
      SSFConfigConstants.currentLogin = 'SSFUsers/';
      $state.go('register');
    };
}]);