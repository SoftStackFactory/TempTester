angular.module('controllers')
.controller('ConLobbyCtrl', ['$scope', '$state', '$ionicHistory', 'UserService','$window', 
        'ServerQuestionService', 'TKQuestionsService', 'TKAnswersService', 'SSFAlertsService',
        'ServerEmployersService', 'SSFSelectServices', '$timeout', 'ionicMaterialInk', 'ionicMaterialMotion',
        '$rootScope',
        function($scope, $state, $ionicHistory, UserService, $window, ServerQuestionService,
        TKQuestionsService, TKAnswersService, SSFAlertsService, ServerEmployersService,
        SSFSelectServices, $timeout, ionicMaterialInk, ionicMaterialMotion, $rootScope) {
    
    $timeout(function(){
        ionicMaterialInk.displayEffect();
        ionicMaterialMotion.ripple();
    },0);

    $scope.$on('$ionicView.enter', function() {
      // Code you want executed every time view is opened
      TKAnswersService.resetAnswers();
      if($window.localStorage.companyId !== undefined) {
        $ionicHistory.nextViewOptions({
          historyRoot: true,
          disableBack: true
        });
        $state.go('compHist.companyHistory');
      }
    });
    
    $scope.logout = function() {
        SSFAlertsService.showConfirm('Logout', 'Are you sure you want to logout?')
        .then(function(response) {
            if(response) {
                delete $window.localStorage['userEmployer'];
                delete $window.localStorage['token'];
                delete $window.localStorage['userID'];
                $ionicHistory.nextViewOptions({
                    historyRoot: true,
                    disableBack: true
                });
                $state.go('landing');
            }
        });
    //     UserService.logout($window.localStorage.token)
    //     .then(function(response) {
    //         //The successful code for logout is 204
    //         if(response.status === 204) {
    //             delete $window.localStorage['token'];
    //             delete $window.localStorage['userID'];
    //             $ionicHistory.nextViewOptions({
    //               historyRoot: true,
    //               disableBack: true
    //             });
    //             $state.go('landing');
    //         }
    //         else {
    //              SSFAlertsService.showAlert("Error","Could not logout at this moment, try again.");
    //         }
    //     }, function(response) {
    //         SSFAlertsService.showAlert("Error","Could not logout at this moment, try again.");
    //     });
    };
    
    //Get Questions Initially if they are not already stored
    if(TKQuestionsService.questionsLenght() === 0)
        getQuestions();
        
    function getQuestions()
    {
        ServerQuestionService.all($window.localStorage['token'])
        .then(function(response) {
            if (response.status === 200) {
                var questions = response.data;
                TKQuestionsService.setQuestions(questions);
            } else if(response.status !== 401) {
                // invalid response
                confirmPrompt();
            }
        }, function(response) {
            // something went wrong
            confirmPrompt();
        });
    }
    
    function confirmPrompt()
    {
        SSFAlertsService.showConfirm("Error","The questions could not be retrieved at this time, do you want to try again?")
        .then(function(response) {
            if (response == true) {
                getQuestions();
            }
        });
    }
    
    $scope.takeTestButtonTapped = function() {
        if($window.localStorage.userEmployer === undefined) {
            SSFAlertsService.showAlert('Error', 'Please select a company to share your results with, or select "None" to not share them.');
        }
        else if(TKQuestionsService.questionsLenght() === 0)
            getQuestions();
        else {
            $state.go('test.detail',{testID:1});
        }
    };
    
    $scope.selectEmployer = function($event) {
        SSFSelectServices.chooseEmployer($event, $scope, 'takeTestButtonTapped');
    };
}]);