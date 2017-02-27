class UserController{
    constructor(userView, requester, baseUrl, appKey){
        this._userView = userView;
        this._requester = requester;
        this._appKey = appKey;
        this._baseServiceUrl = baseUrl + "/user/" + appKey + "/";
    };

    register(data){
        if(data.username.length < 6){
            showPopup('error', "The username is must be more than 6 symbols!");
            return;
        }

        if(data.fullname.length < 6){
            showPopup('error', "The Full Name must be more than 6 symbols");
            return;
        }

        if(data.password != data.confirmPassword){
            showPopup('error', "The password and confirm password don\'t match!");
            return;
        }

        if(data.password.length < 6){
            showPopup('error', "The password is less than 6 symbols!");
            return;
        }

        delete data['confirmPassword'];

        this._requester.post(this._baseServiceUrl, data,
                            function successCallback(response){
                                showPopup('success', "Success Register in the account!");
                                redirectUrl('#/login');
                            },
                            function errorCallback(response) {
                                showPopup('error', "Problem with the register!");
                            });
    }

    login(data){
        let requestUrl = this._baseServiceUrl + "login";
        this._requester.post(requestUrl, data,
                function successCallback(response){
                    sessionStorage.setItem('username', response.username);
                    sessionStorage.setItem('_authToken', response._kmd.authtoken);
                    sessionStorage.setItem('fullname', response.fullname);

                    showPopup('success', "Success Login in the account!");
                    redirectUrl('#/');
                },
                function errorCallback(response) {
                    showPopup('error', "Problem with the login!");
            });
    }

    showLoginPage(isLoggedIn){
        this._userView.showLoginPage(isLoggedIn);
    }

    showRegisterPage(isLoggedIn){
        this._userView.showRegisterPage(isLoggedIn);
    }

    logout(){
        sessionStorage.clear();
        redirectUrl('#/');
    }
}