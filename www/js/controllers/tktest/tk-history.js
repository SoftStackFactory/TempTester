angular.module('controllers')
.controller('TkHistoryCtrl', ['$scope', 'ServerAnswersService', '$window', '$state', 'TKAnswersService',
        'TKResultsButtonService', 'SSFAlertsService', 'TKQuestionsService',
        function($scope, ServerAnswersService, $window, $state, TKAnswersService, TKResultsButtonService,
        SSFAlertsService, TKQuestionsService) {
    
    $scope.pageTitle = 'My Results';
    
    $scope.tests = TKQuestionsService.getCompanyUserData();
    
    if($scope.tests.length === 0) {
        performRequest();
    }
    else {
        $scope.pageTitle = $scope.tests[0].firstName + ' ' + $scope.tests[0].lastName + "'s Results";
    }
    
    function performRequest()
    {
        ServerAnswersService.all($window.localStorage['userID'], $window.localStorage['token'])
        .then(function(response) {
            if (response.status === 200) {
                //Should return an array of tests
                $scope.tests = response.data;
            } else if(response.status !== 401) {
                // invalid 
                confirmPrompt();
            }
        }, function(response) {
            // something went wrong
            confirmPrompt();
        });
    }

    function confirmPrompt()
    {
        SSFAlertsService.showConfirm("Warning","The tests could not be retrieved at the moment, do you want to try again?")
        .then(function(response){
            if (response === true) {
                performRequest();
            } 
        });
    }
    
    $scope.goToResult = function(test)
    {
        // var answers = {
        //     "competing": test.competing,
        //     "collaborating": test.collaborating,
        //     "compromising": test.compromising,
        //     "avoiding": test.avoiding,
        //     "accommodating": test.accommodating
        // };
        TKAnswersService.setAnswers(test);
        TKResultsButtonService.setShouldShowMenuButton(false);
        $state.go('results');
    };
}]);