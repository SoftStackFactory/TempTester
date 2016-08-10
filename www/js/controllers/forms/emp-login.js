angular.module('controllers')
.controller('EmpLoginCtrl', ['$scope', '$state', 'EmpUserService', '$ionicHistory', '$window',
        'SSFAlertsService', '$timeout', 'ionicMaterialInk','ionicMaterialMotion', 'SSFAppCssService',
        'SSFConfigConstants', '$rootScope',
        function($scope, $state, EmpUserService, $ionicHistory, $window, SSFAlertsService, $timeout,
        ionicMaterialInk, ionicMaterialMotion, SSFAppCssService, SSFConfigConstants, $rootScope) {
    
    $timeout(function(){
        ionicMaterialInk.displayEffect();
        ionicMaterialMotion.ripple();
    },0);
    
    $scope.user = {};
    
    var rememberMeValue = $window.localStorage["empRememberMe"] === undefined || $window.localStorage["empRememberMe"] == "true" ?
        true : false;
    
    $scope.checkbox = {'empRememberMe' : rememberMeValue};
    
    if($window.localStorage["empEmail"] !== undefined && rememberMeValue === true)
        $scope.user.email = $window.localStorage["empEmail"];
    
    $scope.loginSubmitForm = function(form) {
        if(!form.$valid)
            return SSFAlertsService.showAlert('Error', 'Please fill in all required fields.');
        EmpUserService.login($scope.user)
        .then(function(response) {
            if(response.status === 401)
                return SSFAlertsService.showAlert("Error","Incorrect username or password");
            if(response.status !== 200)
                return SSFAlertsService.showAlert("Error", "Something went wrong, try again.");
            // if(response.data.companyId !== undefined)
            //     SSFAppCssService.setCss(response.data.appCss.buttonPrimary, response.data.appCss.buttonSecondary, response.data.appCss.header);
            //Should return a token
            setLocalStorage(response.data, form);
        }, function(response) {
            // Code 401 corresponds to Unauthorized access, in this case, the email/password combination was incorrect.
            if(response.status === 401)
                return SSFAlertsService.showAlert("Error","Incorrect username or password");
            //If the data is null, it means there is no internet connection.
            if(response.data === null)
                return SSFAlertsService.showAlert("Error","The connection with the server was unsuccessful, check your internet connection and try again later.");
            SSFAlertsService.showAlert("Error","Something went wrong, try again.");
        });
    };
    
    $scope.register = function() {
        SSFAlertsService.showAlert('Notice', 'To register as a new employer, please email jpbrown@softstackfactory.org for more information.');
    };
    
    function setLocalStorage(data, form) {
        $window.localStorage['userID'] = data.userId;
        $window.localStorage['token'] = data.id;
        $scope.user.password = "";
        form.$setPristine();
        if($scope.checkbox.empRememberMe) {
            $window.localStorage["empEmail"] = $scope.user.email;
        } else {
            delete $window.localStorage["empEmail"];
            $scope.user.email = "";
        }
        $window.localStorage["empRememberMe"] = $scope.checkbox.empRememberMe;
        $ionicHistory.nextViewOptions({
          historyRoot: true,
          disableBack: true
        });
        $window.localStorage['companyId'] = data.companyId;
        $rootScope.refreshEmpLobby = true;
        $state.go('emp-lobby');
    }
}]);