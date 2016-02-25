angular.module('controllers')
.controller('RegisterCtrl', ['$scope', '$state', 'UserService', '$ionicHistory','$window',
        'SSFAlertsService', 'ServerEmployersService', '$timeout', 'ionicMaterialInk',
        'ionicMaterialMotion', '$rootScope', 'SSFAppCssService',
        function($scope, $state, UserService, $ionicHistory, $window, SSFAlertsService,
        ServerEmployersService, $timeout, ionicMaterialInk, ionicMaterialMotion,
        $rootScope, SSFAppCssService) {
    
    $timeout(function(){
        ionicMaterialInk.displayEffect();
        ionicMaterialMotion.ripple();
    },0);

    $scope.user = {};
    $scope.repeatPassword = {};
    $rootScope.stopSpinner = true;
    ServerEmployersService.get()
    .then(function(response) {
        $scope.employers = response.data;
    });
    
    $scope.signupForm = function(form) {
        if(!form.$valid)
            return;
        if($scope.user.password !== $scope.repeatPassword.password)
            return SSFAlertsService.showAlert("Warning","Passwords must match");
        
        $window.localStorage['userEmployer'] = $scope.user.organization;
        UserService.create($scope.user)
        .then(function(response) {
            if(response.status === 422)
                return SSFAlertsService.showAlert("Warning","The email is already taken.");
            if(response.data === null)
                return SSFAlertsService.showAlert("Error","The connection with the server was unsuccessful, check your internet connection and try again later.");
            if(response.status !== 200)
                return SSFAlertsService.showAlert("Error","Something went wrong, try again.");
            
            loginAfterRegister();
            form.$setPristine();
        }, function(response) {
            // status 422 in this case corresonds to the email already registered to the DB
            if(response.status === 422)
                return SSFAlertsService.showAlert("Warning","The email is already taken.");
            //If the data is null, it means there is no internet connection.
            if(response.data === null)
                return SSFAlertsService.showAlert("Error","The connection with the server was unsuccessful, check your internet connection and try again later.");
            SSFAlertsService.showAlert("Error","Something went wrong, try again.");
        });
    };
    //Required to get the access token
    function loginAfterRegister() {
        UserService.login($scope.user)
        .then(function(response) {
            if(response.status !== 200) {
                return SSFAlertsService.showAlert("Error","Account was created, but something went wrong with loggin you in, try again.");
                $state.go('landing');
            }
            setLocalStorage(response.data);
            // sets CSS for normal user based on company chosen.
            // var company;
            // for(var i in $scope.employers) {
            //     if($scope.employers[i].id === $scope.user.organization) {
            //         company = $scope.employers[i];
            //         break;
            //     }
            // }
            // SSFAppCssService.setCss(company.buttonPrimary, company.buttonSecondary, company.header);
            resetFields();
            $ionicHistory.nextViewOptions({
                historyRoot: true,
                disableBack: true
            });
            $state.go('lobby');
        },
        function(response) {
            // something went wrong
            resetFields();
            SSFAlertsService.showAlert("Error","Account was created, but something went wrong with loggin you in, try again.");
            $state.go('landing');
        });
    }
    
    function setLocalStorage(data) {
        //Should return a token
        $window.localStorage["userID"] = data.userId;
        $window.localStorage['token'] = data.id;
    }
    
    function resetFields() {
        $scope.user = {};
        $scope.repeatPassword.password = "";
    }
}]);