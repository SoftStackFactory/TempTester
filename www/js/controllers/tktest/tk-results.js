angular.module('controllers')
.controller('TkResultsCtrl', ['$scope', 'TKAnswersService', '$ionicHistory', '$state',
        'TKResultsButtonService', '$window', 'ServerAnswersService', 'SSFAlertsService',
        'SSFSelectServices', 'TKQuestionsService',
        function($scope, TKAnswersService, $ionicHistory, $state, TKResultsButtonService,
        $window, ServerAnswersService, SSFAlertsService, SSFSelectServices, TKQuestionsService) {
    
    // $scope.$on('$ionicView.enter', function() {
    //     // Code you want executed every time view is opened
    //     $scope.isCompany = $window.localStorage['companyId'] !== undefined ? true : false;
    // });
    $scope.isCompany = $window.localStorage['companyId'] !== undefined ? true : false;
    var answersInfo = TKAnswersService.getAnswers();
    
    $scope.selectEmployer = function($event) {
        //new call getting all of the shared results
        ServerAnswersService.checkTest(answersInfo.userID, answersInfo.createDate, $window.localStorage['token'])
        .then(function(res) {
            var tempArray = [];
            for(var i in res.data) {
                tempArray.push(res.data[i].employerId);
            }
            SSFSelectServices.chooseEmployer($event, $scope, 'addEmployer', tempArray);
        });
    };
    
    $scope.shouldShowButton = TKResultsButtonService.getShouldShowMenuButton();
    $scope.menuButtonTapped = function() {
        $ionicHistory.nextViewOptions({
            historyRoot: true,
            disableBack: true
        });
        $state.go('con-lobby');
    };

    $scope.labels = [
        "Competing " + answersInfo.competing + "/12",
        "Collaborating " + answersInfo.collaborating + "/12",
        "Compromising " + answersInfo.compromising + "/12",
        "Avoiding " + answersInfo.avoiding + "/12",
        "Accommodating " + answersInfo.accommodating + "/12"
    ];
    $scope.showAnswers = false;
    $scope.revealAnswers = function() {
        $scope.showAnswers = true;
    };
    $scope.addEmployer = function() {
        var newInstanceResult = {};
        for(var i in answersInfo) {
            if(i !== '$$hashKey' && i !== 'id' && i !== 'shared') {
                newInstanceResult[i] = answersInfo[i];
            }
        }
        newInstanceResult.employerId = $window.localStorage['userEmployer'];
        newInstanceResult.original = false;
        // ServerAnswersService.checkAll(newInstanceResult.userID, newInstanceResult.employerId, answersInfo.createDate, $window.localStorage.token)
        // .then(function(response) {
        if(answersInfo.shared || answersInfo.shared === undefined) {
            if(newInstanceResult.userID === undefined) {
                newInstanceResult.userID = $window.localStorage.userID;
            }
            ServerAnswersService.create(newInstanceResult, $window.localStorage.token)
            .then(function(newInstance) {
            });
        }
        else {
            if(answersInfo.shared !== undefined)
                SSFAlertsService.showAlert('Error', 'This result has already been shared with that employer.');
        }
        // });
    };
   
    $scope.data = [[returnPercentage(answersInfo["competing"]), returnPercentage(answersInfo["collaborating"]), 
        returnPercentage(answersInfo["compromising"]), returnPercentage(answersInfo["avoiding"]), returnPercentage(answersInfo["accommodating"])]];
    
    $scope.options = {
        scaleIntegersOnly: true,
        animation: true,
        responsive:true,
        maintainAspectRatio: false,
        scaleOverride: true,
        scaleSteps: 4,
        scaleStepWidth: 25,
        scaleStartValue: 0,
        scaleLabel: "<%=value%>"+"%",
        tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value.toFixed(0) %>"+"%",
    };
    
    $scope.colours = [{
        fillColor: "rgba(151,187,205,0.2)",
        strokeColor: "rgba(15,187,25,1)",
        pointColor: "rgba(15,187,25,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(151,187,205,0.8)"
    }];
    
    function returnPercentage(value) {
        return (value / 12) * 100;
    }
    
    $scope.questions = TKQuestionsService.setQuestions();
    $scope.isOdd = function(numb) {
        return numb % 2;
    };
    $scope.consoleLog = function(a) {
        console.log(a);
    };
    $scope.choiceSelected = function(index, index2) {
        // index = JSON.parseInt(index);
        if(answersInfo.answers[index] === $scope.questions[index2].Answer_ID)
            return true;
        return false;
    };
}]);