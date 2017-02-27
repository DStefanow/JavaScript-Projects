class PostView{
    constructor(wrapperSelector, mainContentSelector){
        this._mainContentSelector = mainContentSelector;
        this._wrapperSelector = wrapperSelector;
    };

    showCreatePostPage(data, isLoggedIn){
        let _that = this;
        let requestTemplate = isLoggedIn ? "templates/form-user.html" : "templates/form-guest.html";

        $.get(requestTemplate, function (template) {
            let renderedCreatePost = Mustache.render(template, null);

            $(_that._wrapperSelector).html(renderedCreatePost);

            $.get('templates/create-post.html', function (template) {
                let renderedContent = Mustache.render(template, null);

                $(_that._mainContentSelector).html(renderedContent);

                $('#author').val(data.fullname);

                $('#create-new-post-request-button').on('click', function (event) {
                    let title= $('#title').val();
                    let author = $('#author').val();
                    let content = $('#content').val();
                    let date = moment().format("MMMM Do YYYY");

                    let data ={
                        title: title,
                        content: content,
                        author: author,
                        date: date
                    };

                    triggerEvent('createPost', data);
                });
            });
        });
    }
}