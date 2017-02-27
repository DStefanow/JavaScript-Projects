class PostController{
    constructor(postView, requester, baseUrl, appKey){
        this._postView = postView;
        this._requester = requester;
        this._appKey = appKey;
        this._baseServiceUrl = baseUrl + "/appdata/" + appKey + "/posts/";
    };

    showCreatePostPage(data, isLoggedIn){
        this._postView.showCreatePostPage(data, isLoggedIn);
    }

    createNewPost(requestData){
        if(requestData.title.length < 3){
            showPopup('error', "Post title must have more than 10 symbols");
            return;
        }

        if(requestData.content.length < 10){
            showPopup('error', "Post must have more than 10 symbols.");
            return;
        }

        let requestUrl = this._baseServiceUrl;

        this._requester.post(requestUrl, requestData,
            function success(data) {
                showPopup('success', "You have created a post");
                redirectUrl('#/');
            },
            function error(data) {
                showPopup('error', "An error has occured")
            });
    }
}