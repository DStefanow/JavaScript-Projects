class HomeView{
    constructor(wrapperSelector, mainContentSelector){
        this._wrapperSelector = wrapperSelector;
        this._mainContentSelector = mainContentSelector;
    };

    showGuestPage(sideBarData, mainData){
        let _that = this;
        $.get('templates/welcome-guest.html', function (template) {
            let renderedTemplate = Mustache.render(template, null);

            $(_that._wrapperSelector).html(renderedTemplate);

            $.get('templates/recent-posts.html', function (template) {
                let recentPosts = {
                    recentPosts: sideBarData
                };

                let renderRecentPosts = Mustache.render(template, recentPosts);
                $('.recent-posts').html(renderRecentPosts);
            })

            $.get('templates/posts.html', function (template) {
                let blogPosts = {
                    blogPosts: mainData
                };

                let renderPosts = Mustache.render(template, blogPosts);
                $('.articles').html(renderPosts);
            })

        });
    }

    showUserPage(sideBarData, mainData){
        let _that = this;
        $.get('templates/welcome-user.html', function (template) {
            let renderedTemplate = Mustache.render(template, null);

            $(_that._wrapperSelector).html(renderedTemplate);

            $.get('templates/posts.html', function (template) {
                let blogPosts = {
                    blogPosts: mainData
                };

                let renderPosts = Mustache.render(template, blogPosts);
                $('.articles').html(renderPosts);
            })

            $.get('templates/recent-posts.html', function (template) {
                let recentPosts = {
                    recentPosts: sideBarData
                };

                let renderRecentPosts = Mustache.render(template, recentPosts);
                $('.recent-posts').html(renderRecentPosts);
            })
        });
    }
}