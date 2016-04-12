angular.module('controllers')
.controller('ConLobbyCtrl', ['$scope', '$state', '$ionicHistory','$window', 
        'ServerQuestionService', 'TKQuestionsService', 'TKAnswersService', 'SSFAlertsService',
        'SSFSelectServices', '$timeout', 'ionicMaterialInk', 'ionicMaterialMotion',
        '$rootScope',
        function($scope, $state, $ionicHistory, $window, ServerQuestionService,
        TKQuestionsService, TKAnswersService, SSFAlertsService,
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
            $state.go('emp-lobby');
        }
    });
    
    $scope.logout = function() {
        SSFAlertsService.showConfirm('Logout', 'Are you sure you want to logout?')
        .then(function(response) {
            if(!response)
                return;
            $rootScope.$broadcast('request:auth');
        });
    };
    
    //Get Questions Initially if they are not already stored
    if(TKQuestionsService.questionsLenght() === 0)
        getQuestions();
        
    function getQuestions() {
        ServerQuestionService.all($window.localStorage['token'])
        .then(function(response) {
            if(response.status === 401)
                return confirmPrompt();
            if(response.status !== 200)
                return SSFAlertsService.showAlert('Error', 'Some unknown error occurred.');
            var questions = response.data;
            TKQuestionsService.setQuestions(questions);
        }, function(response) {
            // something went wrong
            confirmPrompt();
        });
    }
    
    function confirmPrompt() {
        SSFAlertsService.showConfirm("Error","The questions could not be retrieved at this time, do you want to try again?")
        .then(function(response) {
            if(response == true)
                getQuestions();
        });
    }
    
    $scope.TKTest = function() {
        if(TKQuestionsService.questionsLenght() === 0)
            getQuestions();
        $state.go('tk-questions.detail',{testID:1});
    };
    
    $scope.selectEmployer = function($event) {
        SSFSelectServices.chooseEmployer($event, $scope, 'TKTest', undefined, 'The Thomas–Kilmann Conflict Mode Instrument test identifies five different styles of conflict management after answering 30 questions: <br>Competing (assertive, uncooperative) <br>Avoiding (unassertive, uncooperative) <br>Accommodating (unassertive, cooperative) <br>Collaborating (assertive, cooperative) <br>Compromising (intermediate assertiveness and cooperativeness)');
    };
    
    $scope.title = $window.localStorage['firstName'] !== undefined ? $window.localStorage['firstName'] + ' ' + $window.localStorage['lastName'] : 'Menu';
    
}]);