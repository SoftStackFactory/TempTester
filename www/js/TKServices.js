angular.module('TKServicesModule', [])
.service('TKQuestionsService', function () {
    var service = this;
    var questions = [];
    var userResults = [];
    
    service.setQuestions = function(serverQuestions)
    {
        if(serverQuestions === undefined)
            return questions;
        questions = serverQuestions;
        
    };
    
    service.getQuestion = function(questionID)
    {
        var results = [];
        questions.forEach(function(question){
            //Search for questions with the specified question ID
            if(question.Question_Number == questionID)
                results.push(question);
        }); 
        return results;
    };
    
    service.questionsLenght = function()
    {
        return questions.length;
    };
    
    service.setCompanyUserData = function(array) {
        userResults = array;
    };
    service.getCompanyUserData = function() {
        return userResults;
    };
})

.service('TKAnswersService', function() {
    var service = this;
    var answerCategories = {
        "competing": 0,
        "collaborating": 0,
        "compromising": 0,
        "avoiding": 0,
        "accommodating": 0
    };
    var answers = [];
    
    var lastQuestionNumber = 0;
    var categoriesStack = [];
    
    service.setLastQuestionNumber = function(qNumber) {
        lastQuestionNumber = parseInt(qNumber);  
    };
    
    service.getLastQuestionNumber = function() {
        return lastQuestionNumber;  
    };
    
    service.saveAnswer = function(questionNumber, answerCategory, option) {
        answerCategories[answerCategory.toLowerCase()]++;
        answers[questionNumber] = option;
        categoriesStack.push(answerCategory);
    };
    
    service.getAnswers = function() {
        return answerCategories;
    };
    service.getArray = function() {
        return answers;
    };
    
    service.setAnswers = function(input) {
        answerCategories = input;
    };
    
    service.resetAnswers = function() {
        for(var property in answerCategories) {
            if(answerCategories.hasOwnProperty(property)) {
                answerCategories[property] = 0;
            }
        }
        lastQuestionNumber = 0;
    };
    
    service.eraseLastAnswer = function() {
        answerCategories[categoriesStack.pop().toLowerCase()]--;
    };
})

.service('TKResultsButtonService', function() {
    var service = this;
    
    var shouldShowButton = false;
    
    service.setShouldShowMenuButton = function(show) {
        shouldShowButton = show;
    };
    
    service.getShouldShowMenuButton = function() {
        return shouldShowButton;
    };
});