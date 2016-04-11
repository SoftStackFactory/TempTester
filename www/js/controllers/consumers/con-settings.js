angular.module('controllers')
.controller('ConSettingsCtrl', ['$scope', '$window', 'SSFAlertsService', 'ConUserService', 'userInfo',
    '$timeout', 'ionicMaterialInk', 'ionicMaterialMotion',
    function($scope, $window, SSFAlertsService, ConUserService, userInfo, $timeout, ionicMaterialInk,
    ionicMaterialMotion) {
  $timeout(function(){
    ionicMaterialInk.displayEffect();
    ionicMaterialMotion.ripple();
  },0);
  $scope.userInfo = userInfo;
  $scope.updateUser = {};
  $scope.repeat = {};
  $scope.submitPassword = function(form) {
    if(form.$invalid)
      return SSFAlertsService.showAlert('Error', 'Please fill in all required fields.');
    if($scope.updateUser.password !== $scope.repeat.password)
      return SSFAlertsService.showAlert('Error', 'Please make sure your passwords match.');
    ConUserService.updateUser($window.localStorage.token, $window.localStorage.userID, $scope.updateUser)
    .then(function(res) {
      if(res.status !== 200)
        return SSFAlertsService.showAlert('Update Failed', res.data.error.message);
      SSFAlertsService.showAlert('Success!', 'Your password has successfully been updated.');
      $scope.updateUser = {};
      $scope.repeat = {};
    }, function(err) {
      if(err.data !== undefined)
        return SSFAlertsService.showAlert('Error', 'Check your connectin to the internet and try again.');
      SSFAlertsService.showAlert('Error', 'Something went wrong.');
    });
  };

}]);