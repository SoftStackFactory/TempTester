// angular.module('controllers')
// .controller('LoginCtrl', ['$scope', '$state', 'UserService', '$ionicHistory', '$window',
//         'SSFAlertsService', '$timeout', 'ionicMaterialInk','ionicMaterialMotion', 'SSFAppCssService',
//         'SSFConfigConstants',
//         function($scope, $state, UserService, $ionicHistory, $window, SSFAlertsService, $timeout,
//         ionicMaterialInk, ionicMaterialMotion, SSFAppCssService, SSFConfigConstants) {
    
//     $timeout(function(){
//         ionicMaterialInk.displayEffect();
//         ionicMaterialMotion.ripple();
//     },0);
    
//     $scope.user = {};
    
//     var rememberMeValue = $window.localStorage["rememberMe"] === undefined || $window.localStorage["rememberMe"] == "true" ?
//         true : false;
    
//     $scope.checkbox = {'rememberMe' : rememberMeValue};
    
//     if($window.localStorage["username"] !== undefined && rememberMeValue === true)
//         $scope.user.email = $window.localStorage["username"];
    
//     $scope.loginSubmitForm = function(form) {
//         if(!form.$valid)
//             return SSFAlertsService.showAlert('Error', 'Please fill in all required fields.');
//         UserService.login($scope.user)
//         .then(function(response) {
//             if(response.status === 401)
//                 return SSFAlertsService.showAlert("Error","Incorrect username or password");
//             if(response.status !== 200)
//                 return SSFAlertsService.showAlert("Error", "Something went wrong, try again.");
//             if(response.data.companyId !== undefined)
//                 SSFAppCssService.setCss(response.data.appCss.buttonPrimary, response.data.appCss.buttonSecondary, response.data.appCss.header);
//             //Should return a token
//             setLocalStorage(response.data, form);
//         }, function(response) {
//             // Code 401 corresponds to Unauthorized access, in this case, the email/password combination was incorrect.
//             if(response.status === 401)
//                 return SSFAlertsService.showAlert("Error","Incorrect username or password");
//             //If the data is null, it means there is no internet connection.
//             if(response.data === null)
//                 return SSFAlertsService.showAlert("Error","The connection with the server was unsuccessful, check your internet connection and try again later.");
//             SSFAlertsService.showAlert("Error","Something went wrong, try again.");
//         });
//     };
    
//     $scope.register = function() {
//         if(SSFConfigConstants.currentLogin === 'CompanyUsers/')
//             return SSFAlertsService.showAlert('Notice', 'To register as a new employer, please email jpbrown@softstackfactory.org for more information.');
//         $state.go('register');
//     };
    
//     function setLocalStorage(data, form) {
//         $window.localStorage['userID'] = data.userId;
//         $window.localStorage['token'] = data.id;
//         $scope.user.password = "";
//         form.$setPristine();
//         if($scope.checkbox.rememberMe) {
//             $window.localStorage["username"] = $scope.user.email;
//         } else {
//             delete $window.localStorage["username"];
//             $scope.user.email = "";
//         }
//         $window.localStorage["rememberMe"] = $scope.checkbox.rememberMe;
//         $ionicHistory.nextViewOptions({
//           historyRoot: true,
//           disableBack: true
//         });
//         if(data.companyId === undefined)
//             return $state.go('con-lobby');
//         $window.localStorage['companyId'] = data.companyId;
//         $state.go('emp-lobby');
//     }
// }]);