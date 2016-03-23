angular.module('controllers')
.controller('EmpSettingsCtrl', ['$scope', 'employer', 'SSFAppCssService', 'ServerEmployersService',
    '$window', 'SSFAlertsService', 'UserService',
    function($scope, employer, SSFAppCssService, ServerEmployersService, $window, SSFAlertsService,
    UserService) {
  var apply;
  $scope.applyChanges = function(value) {
    apply = value === 'true' ? true : false;
  };
  $scope.employerName = employer.company_name;
  if(employer.header !== undefined || employer.header == '')
    employer.header = '#EB7C23';
  if(employer.buttonPrimary !== undefined || employer.buttonPrimary == '')
    employer.buttonPrimary = '#A34D24';
  if(employer.buttonSecondary !== undefined || employer.buttonSecondary == '')
    employer.buttonSecondary = '#808285';
  $scope.preferencesInputs = employer;
  $scope.updatePreferences = function(form) {
    if(!form.$valid)
      return;
    SSFAppCssService.setCss($scope.preferencesInputs.buttonPrimary, $scope.preferencesInputs.buttonSecondary, $scope.preferencesInputs.header, apply);
    if(apply)
      ServerEmployersService.update($window.localStorage.token, $window.localStorage.companyId, $scope.preferencesInputs)
      .then(function(res) {
        if(res.status !== 200)
          SSFAlertsService.showAlert('Error', 'Something went wrong with updating your preferences.');
      },function(err) {
        SSFAlertsService.showAlert('Error', 'Failed to update your preferences.');
      });
  };

  $scope.updateUser = {};
  $scope.repeat = {};
  $scope.submitPassword = function(form) {
    if(form.$invalid)
      return SSFAlertsService.showAlert('Error', 'Please fill in all required fields.');
    if($scope.updateUser.password !== $scope.repeat.password)
      return SSFAlertsService.showAlert('Error', 'Please make sure your passwords match.');
    UserService.updateUser($window.localStorage.token, $window.localStorage.userID, $scope.updateUser, 'CompanyUsers/')
    .then(function(res) {
      if(res.status !== 200)
        return SSFAlertsService.showAlert('Update Failed', res.data.error.message);
      SSFAlertsService.showAlert('Success!', 'Your password has successfully been updated.');
      $scope.updateUser = {};
      $scope.repeat = {};
    }, function(err) {
      if(err.data !== undefined)
        return SSFAlertsService.showAlert('Error', 'Check your connectin to the internet and try again.');
    });
  };

}]);