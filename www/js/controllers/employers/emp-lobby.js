angular.module('controllers')
.controller('EmpLobbyCtrl', ['$scope', 'ServerAnswersService', '$window', '$state', 'UserService',
        'TKAnswersService', 'TKResultsButtonService', 'SSFAlertsService',
        'TKQuestionsService', '$ionicHistory', '$rootScope', 'ServerEmployersService', 'employerName',
        function($scope, ServerAnswersService, $window, $state, UserService, TKAnswersService,
        TKResultsButtonService, SSFAlertsService, TKQuestionsService, $ionicHistory,
        $rootScope, ServerEmployersService, employerName) {
    
    var currentDate, page;
    $scope.employerName = employerName;
    
    $scope.tests = [];
    $scope.testResults = [];
    
    $scope.goToResult = function(test) {
        var answers = {
            "competing": test.competing,
            "collaborating": test.collaborating,
            "compromising": test.compromising,
            "avoiding": test.avoiding,
            "accommodating": test.accommodating
        };
        TKAnswersService.setAnswers(test);
        TKResultsButtonService.setShouldShowMenuButton(false);
        $state.go('tk-history');
    };
    
    $scope.logout = function() {
        SSFAlertsService.showConfirm('Logout', 'Are you sure you want to logout?')
        .then(function(response) {
            if(response) {
                TKQuestionsService.setCompanyUserData([]);
                delete $window.localStorage['userEmployer'];
                delete $window.localStorage['token'];
                delete $window.localStorage['userID'];
                delete $window.localStorage['companyId'];
                $ionicHistory.nextViewOptions({
                    historyRoot: true,
                    disableBack: true
                });
                $state.go('landing');
            }
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
    $scope.scrollResults = function() {
        if(page.nextPage <= page.totalPages) {
            performRequest();
        }
    };
    function performRequest() {
        return ServerAnswersService.allByEmployerId(currentDate, undefined, page.nextPage, $window.localStorage.companyId, $window.localStorage.token)
        .then(function(response) {
            $scope.persons = response.data.results;
            for (var i in $scope.persons) {
                $scope.persons[i].dataArray = [[returnPercentage($scope.persons[i].competing), returnPercentage($scope.persons[i].collaborating), 
                returnPercentage($scope.persons[i].compromising), returnPercentage($scope.persons[i].avoiding), returnPercentage($scope.persons[i].accommodating)]];
            }
            page = {'nextPage': response.data.nextPage, 'totalPages': response.data.totalPages};
            return response;
        },function(err) {
            console.log(err);
        });
    }
    
    $scope.ifTest = function(count) {
        if (count == 1) {
            return 'Test';
        } else {
            return 'Tests';
        }
    };
    
    $scope.moreTests = function(userData) {
        var tempDate = new Date();
        tempDate = tempDate.toUTCString();
        ServerAnswersService.allBySharedId(tempDate, undefined, undefined, $window.localStorage.companyId, $window.localStorage.token, userData.userID)
        .then(function(res) {
            if(res.status === 200) {
                res.data.results[0].firstName = userData.firstName;
                res.data.results[0].lastName = userData.lastName;
                TKQuestionsService.setCompanyUserData(res.data.results);
                tk-history');
            }
        },function(err) {
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

    function returnPercentage (value)
    {
        return (value/12)*100;
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
}]);