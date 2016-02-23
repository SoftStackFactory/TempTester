angular.module('starter.controllers', [])

.controller('LoginCtrl', ['$scope', '$state', 'UserService', '$ionicHistory', '$window',
        'SSFAlertsService', '$timeout', 'ionicMaterialInk','ionicMaterialMotion',
        function($scope, $state, UserService, $ionicHistory, $window, SSFAlertsService, $timeout,
        ionicMaterialInk, ionicMaterialMotion) {
    
    
    $timeout(function(){
        ionicMaterialInk.displayEffect();
        ionicMaterialMotion.ripple();
    },0);
    
    $scope.user = {};
    
    var rememberMeValue;
    if($window.localStorage["rememberMe"] === undefined || $window.localStorage["rememberMe"] == "true") {
        rememberMeValue = true;
    }else {
        rememberMeValue = false;
    }
    
    $scope.checkbox = {
        rememberMe : rememberMeValue
    };
    
    if($window.localStorage["username"]!== undefined && rememberMeValue === true) {
        $scope.user.email = $window.localStorage["username"];
    }

    
    $scope.loginSubmitForm = function(form) {
        if(form.$valid) {   
            UserService.login($scope.user)
            .then(function(response) {
                if (response.status === 200) {
                    //Should return a token
                    $ionicHistory.nextViewOptions({
                      historyRoot: true,
                      disableBack: true
                    });
                    // $state.go('lobby');
                    
                    $window.localStorage['userID'] = response.data.userId;
                    $window.localStorage['token'] = response.data.id;
                    if(response.data.companyId !== undefined) {
                        $window.localStorage['companyId'] = response.data.companyId;
                        $state.go('compHist.companyHistory');
                        
                    }
                    else {
                        $state.go('lobby');
                    }
                    
                    
                    if($scope.checkbox.rememberMe) {
                        $window.localStorage["username"] = $scope.user.email;
                    }else {
                        delete $window.localStorage["username"];
                        $scope.user.email = "";
                    }
                    $window.localStorage["rememberMe"] = $scope.checkbox.rememberMe;
                    $scope.user.password = "";
                    form.$setPristine();
                } else {
                    // invalid response
                    if(response.status === 401)
                    {
                        SSFAlertsService.showAlert("Error","Incorrect username or password");
                    }else {
                        SSFAlertsService.showAlert("Error", "Something went wrong, try again.");
                    }
                }
            }, function(response) {
                // Code 401 corresponds to Unauthorized access, in this case, the email/password combination was incorrect.
                if(response.status === 401)
                {
                    SSFAlertsService.showAlert("Error","Incorrect username or password");
                }else if(response.data === null) {
                //If the data is null, it means there is no internet connection.
                    SSFAlertsService.showAlert("Error","The connection with the server was unsuccessful, check your internet connection and try again later.");
                }else {
                    SSFAlertsService.showAlert("Error","Something went wrong, try again.");
                }
                
            });
        }
    };
}])
.controller('RegisterCtrl',['$scope', '$state', 'UserService', '$ionicHistory','$window',
        'SSFAlertsService', 'ServerEmployersService', '$timeout', 'ionicMaterialInk',
        'ionicMaterialMotion', '$rootScope',
        function($scope, $state, UserService, $ionicHistory, $window, SSFAlertsService,
        ServerEmployersService, $timeout, ionicMaterialInk, ionicMaterialMotion,
        $rootScope) {
    
    
    $timeout(function(){
        ionicMaterialInk.displayEffect();
        ionicMaterialMotion.ripple();
    },0);
    // '$timeout', 'ionicMaterialInk','ionicMaterialMotion', $timeout, ionicMaterialInk, ionicMaterialMotion

    $scope.user = {};
    $scope.repeatPassword = {};
    $rootScope.stopSpinner = true;
    ServerEmployersService.get()
    .then(function(response) {
        $scope.employers = response.data;
    });
    $scope.signupForm = function(form)
    {
        if(form.$valid)
        {   
            if($scope.user.password !== $scope.repeatPassword.password)
            {
                SSFAlertsService.showAlert("Warning","Passwords must match");
            }else {
                $window.localStorage['userEmployer'] = $scope.user.organization;
                UserService.create($scope.user)
                .then(function(response) {
                    if (response.status === 200) {
                        loginAfterRegister();
                        form.$setPristine();
                    } else {
                        // status 422 in this case corresonds to the email already registered to the DB
                        if(response.status === 422)
                        {
                            SSFAlertsService.showAlert("Warning","The email is already taken.");
                        }else if(response.data === null){
                             //If the data is null, it means there is no internet connection.
                            SSFAlertsService.showAlert("Error","The connection with the server was unsuccessful, check your internet connection and try again later.");
                        }else {
                            SSFAlertsService.showAlert("Error","Something went wrong, try again.");
                        }
                    }
                }, function(response) {
                    // status 422 in this case corresonds to the email already registered to the DB
                    if(response.status === 422)
                    {
                        SSFAlertsService.showAlert("Warning","The email is already taken.");
                    }else if(response.data === null){
                         //If the data is null, it means there is no internet connection.
                        SSFAlertsService.showAlert("Error","The connection with the server was unsuccessful, check your internet connection and try again later.");
                    }else {
                        SSFAlertsService.showAlert("Error","Something went wrong, try again.");
                    }
                });
            }
        }
    };
    //Required to get the access token
    function loginAfterRegister() {
        UserService.login($scope.user)
        .then(function(response) {
            if (response.status === 200) {
                //Should return a token
                $window.localStorage["userID"] = response.data.userId;
                $window.localStorage['token'] = response.data.id;
                $ionicHistory.nextViewOptions({
                    historyRoot: true,
                    disableBack: true
                });
                setCss();
                $state.go('lobby');
            }
            else {
                // invalid response
                $state.go('landing');
            }
            resetFields();
        },
        function(response) {
            // something went wrong
            $state.go('landing');
            resetFields();
        });
    }
    
    function resetFields()
    {
        $scope.user.email = "";
        $scope.user.firstName = "";
        $scope.user.lastName = "";
        $scope.user.organization = "";
        $scope.user.password = "";
        $scope.repeatPassword.password = "";
    }
    function setCss() {
        var company;
        for(var i in $scope.employers) {
            if($scope.employers[i].id === $scope.user.organization) {
                company = $scope.employers[i];
                break;
            }
        }
        var sheet = window.document.styleSheets[0];
        $window.localStorage['appCss'] = JSON.stringify({
            'buttonPrimary': company.buttonPrimary,
            'buttonSecondary': company.buttonSecondary,
            'header': company.header
        });
        sheet.insertRule(
            '.app-button {' +
                'font-weight: bold !important;' + 
                'background-color: ' + company.buttonPrimary + ' !important;' + 
            '}', sheet.cssRules.length);
        sheet.insertRule(
            '.app-button-inverted {' + 
                'font-weight: bold !important;' + 
                'background-color: ' + company.buttonSecondary + ' !important;' + 
            '}', sheet.cssRules.length);
        sheet.insertRule(
            '.app-bar-header {' + 
                'background-color: ' + company.header + ' !important;' + 
            '}', sheet.cssRules.length);
        sheet.insertRule(
            '.app-tabs {' + 
                'font-weight: bold !important;' + 
                'background-color: ' + company.buttonPrimary + ' !important;' + 
            '}', sheet.cssRules.length);
    }
}])

.controller('LobbyCtrl',['$scope', '$state', '$ionicHistory', 'UserService','$window', 
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
}])

.controller('TestCtrl', ['$scope', 'testInfo', '$stateParams', '$state', '$window',
'TKQuestionsService', 'TKAnswersService', 'ServerAnswersService', '$ionicHistory', 
'TKResultsButtonService', 'SSFAlertsService', 'UserService', 'ServerCompanyToTestsService',
function($scope, testInfo, $stateParams, $state, $window, TKQuestionsService, 
TKAnswersService, ServerAnswersService, $ionicHistory, TKResultsButtonService,
SSFAlertsService, UserService, ServerCompanyToTestsService) {
    //testInfo is passed in the router to indicate the index
    var qNumber = $stateParams.testID;
    $scope.title = "Question #"+qNumber;

    $scope.$on("$ionicView.beforeEnter", function(){
        var lastQuestionNumber = TKAnswersService.getLastQuestionNumber();
        if(parseInt(qNumber)<lastQuestionNumber)
        {
            TKAnswersService.setLastQuestionNumber(lastQuestionNumber-1);
            TKAnswersService.eraseLastAnswer();
        }
        TKAnswersService.setLastQuestionNumber(qNumber);
    });
    
    testInfo.forEach(function(infoDict)
    {
        if(infoDict.Answer_ID === "A")
            $scope.questionA = infoDict;
        if(infoDict.Answer_ID === "B")
            $scope.questionB = infoDict;
    });
    
    $scope.buttonClicked = function ( option ) {
        var category = $scope["question"+option].Style;
        TKAnswersService.saveAnswer(qNumber, category, option);
        
        var nextqNumber = Number(qNumber) +1;
        if(nextqNumber>30) {
            performRequest();
        }else {
            $state.go('test.detail',{testID:nextqNumber});
        }
    };
    
    function performRequest()
    {
        var answersDict = angular.copy(TKAnswersService.getAnswers());
        answersDict["userID"] = $window.localStorage['userID'];
        answersDict["employerId"] = $window.localStorage['userEmployer'];
        answersDict["original"] = true;
        var date = new Date();
        answersDict["createDate"] = date.toUTCString();
        delete answersDict.id;
        ServerAnswersService.create(answersDict, $window.localStorage['token'])
        .then(function(response) {
            if (response.status === 200) {
                UserService.updateUser($window.localStorage['token'], $window.localStorage['userID'], {'organization': $window.localStorage['userEmployer']});
                $ionicHistory.nextViewOptions({
                  disableBack: true
                });
                TKAnswersService.setAnswers(answersDict);
                TKResultsButtonService.setShouldShowMenuButton(true);
                $state.go('results');
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
        SSFAlertsService.showConfirm("Warning","The answers could not be saved at the moment, do you want to try again?")
        .then(function(response){
            if (response == true) {
                performRequest();
            }else {
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                TKResultsButtonService.setShouldShowMenuButton(true);
                $state.go('results');
            }
        });
    }
    
}])
.controller('ResultsCtrl', ['$scope', 'TKAnswersService', '$ionicHistory', '$state',
        'TKResultsButtonService', '$window', 'ServerCompanyToTestsService',
        'ServerEmployersService', 'ServerAnswersService', 'SSFAlertsService',
        'SSFSelectServices',
        function($scope, TKAnswersService, $ionicHistory, $state, TKResultsButtonService,
        $window, ServerCompanyToTestsService, ServerEmployersService, ServerAnswersService,
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
        $state.go('lobby');
    };
    
    $scope.labels = ["Competing", "Collaborating", "Compromising", "Avoiding", "Accommodating"];

    ServerEmployersService.get()
    .then(function(response) {
        $scope.employers = response.data;
    });
    
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

}])
.controller('HistoryCtrl', ['$scope', 'ServerAnswersService', '$window', '$state', 'TKAnswersService',
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
}])
.controller('companyHistoryCtrl', ['$scope', 'ServerAnswersService', '$window', '$state', 'UserService',
        'TKAnswersService', 'TKResultsButtonService', 'SSFAlertsService',
        'TKQuestionsService', '$ionicHistory', '$rootScope', 'ServerEmployersService', 'employerName',
        function($scope, ServerAnswersService, $window, $state, UserService, TKAnswersService,
        TKResultsButtonService, SSFAlertsService, TKQuestionsService, $ionicHistory,
        $rootScope, ServerEmployersService, employerName) {
    
    
    $scope.employerName = employerName;
    $scope.doRefresh = function() {
        $rootScope.stopSpinner = true;
        performRequest()
        .then(function(res) {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };
    
    $scope.tests = [];
    performRequest();
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
        $state.go('results');
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
    function performRequest() {
        return ServerAnswersService.allByEmployerId($window.localStorage.companyId, $window.localStorage.token)
        .then(function(response) {
            $scope.persons = response.data.structuredResults;
            for (var i in $scope.persons) {
                $scope.persons[i][0].dataArray = [[returnPercentage($scope.persons[i][0].competing), returnPercentage($scope.persons[i][0].collaborating), 
                returnPercentage($scope.persons[i][0].compromising), returnPercentage($scope.persons[i][0].avoiding), returnPercentage($scope.persons[i][0].accommodating)]];
            }
            return response;
        });
    }
    
    $scope.ifTest = function(person) {
        if (person.length == 1) {
            return 'Test';
        } else {
            return 'Tests';
        }
    };
    
    
    $scope.moreTests = function(person) {
        TKQuestionsService.setCompanyUserData(person);
        $state.go('history');
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