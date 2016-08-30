angular.module('RESTConnection', [])
.constant('ENDPOINT_URL', 
'https://apitemperamenttests.softstackfactory.com/api/')
.service('ConUserService', ['$http', 'ENDPOINT_URL', 'SSFConfigConstants',
function ($http, ENDPOINT_URL, SSFConfigConstants) {
  var service = this;
  // path = 'SSFUsers/';
  
  function getUrl() {
    return ENDPOINT_URL + 'SSFUsers/';
  }
  
  service.create = function (user) {
    return $http.post(getUrl(), user);
  };
  
  service.login = function(user) {
    user['ttl'] = 1209600000;
    return $http.post(getUrl() + 'login', user);
  };
  
  service.updateUser = function(token, userId, newData) {
    return $http({
      url: getUrl() + userId,
      method: 'PUT',
      data: newData,
      headers: {
        'Authorization': token
      }
   });
  };
  
  service.getById = function(token, userId) {
    return $http({
      url: getUrl() + userId,
      method: 'GET',
      headers: {
        'Authorization': token
      }
   });
  };
  
  service.logout = function(token) {
    return $http({
        url: getUrl() + 'logout',
        method: 'POST',
        headers: {
          'Authorization': token
        }
     });
  };
}])
.service('EmpUserService', ['$http', 'ENDPOINT_URL', 'SSFConfigConstants',
function ($http, ENDPOINT_URL, SSFConfigConstants) {
  var service = this;
  // path = 'SSFUsers/';
  
  function getUrl() {
    return ENDPOINT_URL + 'CompanyUsers/';
  }
  
  service.create = function (user) {
    return $http.post(getUrl(), user);
  };
  
  service.login = function(user) {
    user['ttl'] = 1209600000;
    return $http.post(getUrl() + 'login', user);
  };
  
  service.updateUser = function(token, userId, newData) {
    return $http({
      url: getUrl() + userId,
      method: 'PUT',
      data: newData,
      headers: {
        'Authorization': token
      }
   });
  };
  
  // service.getById = function(token, userId, whichModel) {
  //   return $http({
  //     url: getUrl() + userId,
  //     method: 'GET',
  //     headers: {
  //       'Authorization': token
  //     }
  // });
  // };
  
  service.logout = function(token) {
    return $http({
        url: getUrl() + 'logout',
        method: 'POST',
        headers: {
          'Authorization': token
        }
     });
  };
}])

.service('ServerQuestionService', ['$http', 'ENDPOINT_URL',
function ($http,  ENDPOINT_URL) {
  var service = this,
  path = 'Questions/';

  function getUrl() {
    return ENDPOINT_URL + path;
  }

  service.all = function (token) {
    return $http.get(getUrl(), {
        params: { access_token: token }
    });
  };

}])
.service('ServerAnswersService', ['$http', 'ENDPOINT_URL', 
function ($http, ENDPOINT_URL) {
  var service = this,
  path = 'TestResults/';

  function getUrl() {
    return ENDPOINT_URL + path;
  }

  service.create = function(answer, token) {
    return $http({
        url: getUrl(),
        method: 'POST',
        data: JSON.stringify(answer),
        headers: {
            'Authorization': token
        }
     });
  };
  
  service.all = function(userID, token) {
    return $http.get(getUrl()+'?filter[where][userID]='+userID+'&filter[where][original]=true',{
        params: { access_token: token }
    });
  };
  service.checkTest = function(userId, createDate, token) {
    return $http.get(getUrl()+
        '?filter[where][userID]='+userId+
        '&filter[where][createDate]='+createDate +
        '&filter[fields][employerId]=true',{
      params: { access_token: token }
    });
  };
  service.allByEmployerId = function(date, limit, nextPage, employerId, token, startDate) {
    var tempDate = {};
    if(date) tempDate.lt = date;
    if(startDate) tempDate.gt = startDate;
    console.log(tempDate);
    return $http({
      url: getUrl()+'page',
      method: 'POST',
      data: {
        'date': tempDate,
        'limit': limit,
        'filters': {
          'where': {
            'employerId': employerId
          },
          'order': 'createDate DESC'
        },
        'nextPage': nextPage,
        'unique': 'userID'
      },
      headers: {
          'Authorization': token,
          'Content-Type':'application/json'
      }
    });
  };
  service.allBySharedId = function(date, limit, nextPage, employerId, token, userId) {
    return $http({
      url: getUrl()+'page',
      method: 'POST',
      data: {
        'date': {lt: date},
        'limit': limit,
        'filters': {
          'where': {
            'employerId': employerId,
            'userID': userId
          },
          'order': 'createDate DESC'
        },
        'nextPage': nextPage
      },
      headers: {
          'Authorization': token,
          'Content-Type':'application/json'
      }
    });
  };

}])
.service('ServerEmployersService', ['$http', 'ENDPOINT_URL', 
function ($http, ENDPOINT_URL) {
  var service = this,
  path = 'Employers/';

  function getUrl() {
    return ENDPOINT_URL + path;
  }

  service.get = function() {
    return $http({
      url: getUrl()+'?filter[where][active]=true',
      method: 'GET'
     });
  };
  
  service.getAll = function() {
    return $http({
      url: getUrl(),
      method: 'GET'
     });
  };
  
  service.update = function(token, companyId, newModel) {
    return $http({
      url: getUrl()+companyId,
      method: 'PUT',
      data: newModel,
      headers: {
        'Authorization': token
      }
   });
  };
}]);
