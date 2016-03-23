angular.module('controllers')
.controller('EmpLobbyCtrl', ['$scope', 'ServerAnswersService', '$window', '$state',
        'TKAnswersService', 'TKResultsButtonService', 'SSFAlertsService',
        'TKQuestionsService', '$rootScope', 'employerName', 'ServerQuestionService',
        function($scope, ServerAnswersService, $window, $state, TKAnswersService,
        TKResultsButtonService, SSFAlertsService, TKQuestionsService,
        $rootScope, employerName, ServerQuestionService) {
    
    var currentDate, page;
    $scope.employerName = employerName;
    
    $scope.tests = [];
    $scope.testResults = [];
    
    $scope.goToResult = function(test) {
        TKAnswersService.setAnswers(test);
        TKResultsButtonService.setShouldShowMenuButton(false);
        $state.go('tk-results');
    };
    
    $scope.logout = function() {
        SSFAlertsService.showConfirm('Logout', 'Are you sure you want to logout?')
        .then(function(response) {
            if(response)
                $rootScope.$broadcast('request:auth');
        });
    };
    $scope.companiesArray = [];
    $scope.refreshResults = function() {
        performRequest();
    };
    $scope.doRefresh = function() {
        page = {'nextPage': undefined};
        currentDate = new Date();
        currentDate = currentDate.toUTCString();
        $rootScope.stopSpinner = true;
        performRequest()
        .then(function(res) {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };
    $scope.doRefresh();
    var stopScrolling = false;
    $scope.scrollResults = function() {
        if(page.nextPage <= page.totalPages) {
            performRequest();
        }
    };
    function performRequest() {
        if(stopScrolling)
            return;
        return ServerAnswersService.allByEmployerId(currentDate, 15, page.nextPage, $window.localStorage.companyId, $window.localStorage.token)
        .then(function(response) {
            if(response.status !== 200)
                return stopScrolling = true;
            $scope.persons = response.data.results;
            for (var i in $scope.persons) {
                $scope.persons[i].dataArray = [[returnPercentage($scope.persons[i].competing), returnPercentage($scope.persons[i].collaborating), 
                returnPercentage($scope.persons[i].compromising), returnPercentage($scope.persons[i].avoiding), returnPercentage($scope.persons[i].accommodating)]];
            }
            page = {'nextPage': response.data.nextPage, 'totalPages': response.data.totalPages};
            return response;
        },function(err) {
            stopScrolling = true;
            if(err.data === null)
                return;
            SSFAlertsService.showConfirm('Error', 'There was a problem getting more results, do you want to try again?')
            .then(function(res) {
                if(res)
                    stopScrolling = false;
            });
        });
    }
    
    $scope.ifTest = function(count) {
        if(count == 1)
            return 'Test';
        return 'Tests';
    };
    
    $scope.moreTests = function(userData) {
        var tempDate = new Date();
        tempDate = tempDate.toUTCString();
        ServerAnswersService.allBySharedId(tempDate, 15, undefined, $window.localStorage.companyId, $window.localStorage.token, userData.userID)
        .then(function(res) {
            if(res.status !== 200)
                return SSFAlertsService.showConfirm('Error', 'Something went wrong with getting the users results.')
                .then(function(res) {
                    if(res)
                        $scope.moreTests();
                    return;
                });
            res.data.results[0].firstName = userData.firstName;
            res.data.results[0].lastName = userData.lastName;
            TKQuestionsService.setCompanyUserData(res.data.results);
            $state.go('tk-history');
        },function(err) {
            if(err.data === null)
                return SSFAlertsService.showAlert('Error', 'We cannot retrieve the data while offline.');
            return SSFAlertsService.showConfirm('Error', 'Something went wrong with getting the users results.')
            .then(function(res) {
                if(res)
                    $scope.moreTests();
                return;
            });
        });
    };

    $scope.options = {
        scaleIntegersOnly: true,
        animation: true,
        responsive:true,
        maintainAspectRatio: false,
        showScale: false,
        scaleOverride: true,
        scaleSteps: 4,
        scaleStepWidth: 25,
        scaleStartValue: 0,
        tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value.toFixed(0) %>"+"%"
    };
    
    $scope.colours = [{
        fillColor: "rgba(151,187,205,0.2)",
        strokeColor: "rgba(15,187,25,1)",
        pointColor: "rgba(15,187,25,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(151,187,205,0.8)"
    }];
    
    $scope.labels = ["Competing", "Collaborating", "Compromising", "Avoiding", "Accommodating"];

    function returnPercentage (value) {
        return (value / 12) * 100;
    }
    
    $scope.anyResults = function() {
        if($scope.persons === undefined)
            return true;
        if($scope.persons.length === 0)
            return false;
        return true;
    };
    
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
}]);