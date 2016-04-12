angular.module('controllers')
.controller('TkHistoryCtrl', ['$scope', 'ServerAnswersService', '$window', '$state', 'TKAnswersService',
        'TKResultsButtonService', 'SSFAlertsService', 'TKQuestionsService',
        function($scope, ServerAnswersService, $window, $state, TKAnswersService, TKResultsButtonService,
        SSFAlertsService, TKQuestionsService) {
    
    $scope.tests = TKQuestionsService.getCompanyUserData();
    
    if($scope.tests.length === 0) {
        $scope.pageTitle = 'My Results';
        performRequest();
    } else {
        $scope.pageTitle = $scope.tests[0].firstName + ' ' + $scope.tests[0].lastName + "'s Results";
    }
    
    function performRequest() {
        ServerAnswersService.all($window.localStorage['userID'], $window.localStorage['token'])
        .then(function(response) {
            if(response.status !== 200)
                return confirmPrompt();
            //Should return an array of tests
            $scope.tests = response.data;
        }, function(response) {
            // something went wrong
            confirmPrompt();
        });
    }

    function confirmPrompt() {
        SSFAlertsService.showConfirm("Warning","The tests could not be retrieved at the moment, do you want to try again?")
        .then(function(response){
            if(response === true)
                performRequest();
        });
    }
    
    $scope.goToResult = function(test) {
        TKAnswersService.setAnswers(test);
        TKResultsButtonService.setShouldShowMenuButton(false);
        $state.go('tk-results');
    };
    
    $scope.isInverted = false;
    $scope.invertResults = function() {
        $scope.tests.reverse();
        $scope.isInverted = $scope.isInverted ? false : true;
    };
    $scope.whichIndex = function(a) {
        return $scope.isInverted ? $scope.tests.length + 1 - a : a;
    };
    $scope.invertResults();
}]);