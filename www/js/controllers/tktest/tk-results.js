angular.module('controllers')
.controller('TkResultsCtrl', ['$scope', 'TKAnswersService', '$ionicHistory', '$state',
        'TKResultsButtonService', '$window',
        'ServerEmployersService', 'ServerAnswersService', 'SSFAlertsService',
        'SSFSelectServices',
        function($scope, TKAnswersService, $ionicHistory, $state, TKResultsButtonService,
        $window, ServerEmployersService, ServerAnswersService,
        SSFAlertsService, SSFSelectServices) {
    
    $scope.$on('$ionicView.enter', function() {
        // Code you want executed every time view is opened
        $scope.isCompany = $window.localStorage['companyId'] !== undefined ? true : false;
    });
    $scope.isCompany = $window.localStorage['companyId'] !== undefined ? true : false;
    
    $scope.selectEmployer = function($event) {
        SSFSelectServices.chooseEmployer($event, $scope, 'addEmployer');
    };
    
    $scope.shouldShowButton = TKResultsButtonService.getShouldShowMenuButton();
    $scope.menuButtonTapped = function() {
        $ionicHistory.nextViewOptions({
            historyRoot: true,
            disableBack: true
        });
        $state.go('con-lobby');
    };
    
    $scope.labels = ["Competing", "Collaborating", "Compromising", "Avoiding", "Accommodating"];

    // ServerEmployersService.get()
    // .then(function(response) {
    //     $scope.employers = response.data;
    // });
    
    $scope.companyChange = function() {
        $window.localStorage['userEmployer'] = $scope.user.organization;
    };
    
    var answersInfo = TKAnswersService.getAnswers();
    
    
    $scope.addEmployer = function() {
        var newInstanceResult = {};
        for(var i in answersInfo) {
            if(i !== '$$hashKey' && i !== 'id') {
                newInstanceResult[i] = answersInfo[i];
            }
        }
        newInstanceResult.employerId = $window.localStorage['userEmployer'];
        newInstanceResult.original = false;
        ServerAnswersService.checkAll(newInstanceResult.userID, newInstanceResult.employerId, answersInfo.createDate, $window.localStorage.token)
        .then(function(response) {
            if(response.data.length === 0) {
                if(newInstanceResult.userID === undefined) {
                    newInstanceResult.userID = $window.localStorage.userID;
                }
                ServerAnswersService.create(newInstanceResult, $window.localStorage.token)
                .then(function(newInstance) {
                });
            }
            else {
                SSFAlertsService.showAlert('Error', 'This result has already been shared with that employer.');
            }
        });
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
    
    function returnPercentage (value)
    {
        return (value/12)*100;
    }

}]);