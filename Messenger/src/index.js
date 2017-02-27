
const baseUrl = "https://baas.kinvey.com/";
const appKey = "kid_rJt70ucXl";
const appSecret = "8fa4b4a06cfb44b9a7ab469cf3ff0f94";

const appAuthHeaders  ={
  'Authorization': 'Basic ' + btoa(appKey + ":" + appSecret)
};

function startApp() {
    sessionStorage.clear(); // Clear the user auth data

    showHideMenuLinks();
    showView('viewAppHome');

    bindLinks(); // bind the link

    showHideAlerts();

    $(document).on({
        ajaxStart: function () { $('#loadingBox').show(); },
        ajaxStop: function () { $('#loadingBox').hide(); }
    });

    addListenersForm();
}

function showHideAlerts() {
    $('#infoBox, #errorBox').click(function () {
        $(this).fadeOut();
    });
}

function bindLinks() {
    $('#linkMenuAppHome').click(showHomeView);
    $('#linkMenuLogin').click(showLoginView);
    $('#linkMenuRegister').click(showRegisterView);

    $('#linkMenuUserHome').click(showHomeView);
    $('#linkMenuMyMessages').click(showMessageView);
    $('#linkMenuArchiveSent').click(showArchiveView);
    $('#linkMenuSendMessage').click(showSendMessageView);
    $('#linkMenuLogout').click(logoutUser);

    $('#linkUserHomeMyMessages').click(showMessageView);
    $('#linkUserHomeSendMessage').click(showSendMessageView);
    $('#linkUserHomeArchiveSent').click(showArchiveView);
}

function showHideMenuLinks() {
    if(sessionStorage.getItem('authToken')){
        $('#linkMenuAppHome').hide();
        $('#viewUserHome').show();
        $('#linkMenuLogin').hide();
        $('#linkMenuRegister').hide();

        $('#linkMenuUserHome').show();
        $('#linkMenuMyMessages').show();
        $('#linkMenuArchiveSent').show();
        $('#linkMenuSendMessage').show();
        $('#linkMenuLogout').show();
    }
    else {
        $('#linkMenuAppHome').show();
        $('#linkMenuLogin').show();
        $('#linkMenuRegister').show();
        $('#spanMenuLoggedInUser').hide();

        $('#linkMenuUserHome').hide();
        $('#linkMenuMyMessages').hide();
        $('#linkMenuArchiveSent').hide();
        $('#linkMenuSendMessage').hide();
        $('#linkMenuLogout').hide();
    }
}

function showView(viewId) {
    // Hide all view and display only the selected
    $('main > section').hide();
    $('#errorBox').hide();
    $('#' + viewId).show();
}

function showHomeView() {
    if(sessionStorage.getItem('authToken')){
        showView('viewUserHome')
    } else {
        showView('viewAppHome');
    }
}

function showLoginView() {
    showView('viewLogin');
    $('#formLogin').trigger('reset');
}

function showRegisterView() {
    showView('viewRegister');
    $('#formRegister').trigger('reset');
}

function showMessageView() {
    showView('viewMyMessages');

    getRecentMessages();
}

function getRecentMessages() {
    let username = sessionStorage.getItem('username');
    let autToken = sessionStorage.getItem('authToken');

    $.ajax({
        method: "GET",
        url: baseUrl + "appdata/" + appKey + `/messages?query={"recipient_username":"${username}"}`,
        headers: {"authorization": `Kinvey ${autToken}`},
        success: getMessagessSuccess,
        error: handleAjaxError
    });

    function getMessagessSuccess(infoMsg) {
        $('#myMessages').find('table').remove();

        let msgTable = $('<table>')
            .append($('<thead>')
                .append('<th>From</th><th>Message</th><th>Date Received</th>'));

        for(let msg of infoMsg){
            appendMsgRow(msg, msgTable);
        }

        $('#myMessages').append(msgTable);

        function appendMsgRow(msg, msgTable) {
            let from = msg.sender_username;
            let text = msg.text;
            let date = formatDate(msg._kmd.ect);

            if(msg.sender_name != "")
                from += ` (${msg.sender_name})`;

            msgTable.append($('<tr>')
                .append($('<td>').text(from))
                .append($('<td>').text(text))
                .append($('<td>').text(date)));
        }
    }
}

function showArchiveView() {
    showView('viewArchiveSent');
    
    getArchiveMessages();
}

function getArchiveMessages() {
    let username = sessionStorage.getItem('username');
    let autToken = sessionStorage.getItem('authToken');

    $.ajax({
        method: "GET",
        url: baseUrl + "appdata/" + appKey + `/messages?query={"sender_username":"${username}"}`,
        headers: {"authorization": `Kinvey ${autToken}`},
        success: getSendMessagessSuccess,
        error: handleAjaxError
    });

    function getSendMessagessSuccess(infoMsg) {
        $('#sentMessages').find('table').remove();

        let sendTable = $('<table>')
            .append($('<thead>')
                .append('<th>To</th><th>Message</th><th>Date Sent</th><th>Actions</th>'));

        for(let msg of infoMsg){
            appendSentRow(msg, sendTable);
        }

        $('#sentMessages').append(sendTable);

        function appendSentRow(msg, sendTable) {
            let recepient = msg.recipient_username;
            let text = msg.text;
            let date = formatDate(msg._kmd.ect);

            sendTable.append($('<tr>')
                .append($('<td>').text(recepient))
                .append($('<td>').text(text))
                .append($('<td>').text(date))
                .append($('<td>')
                    .append($('<button>Delete</button>')
                        .attr('id', msg._id)
                        .click(deleteMsg))));
        }

        function deleteMsg() {
            $.ajax({
                method: "DELETE",
                url: `https://baas.kinvey.com/appdata/kid_rJt70ucXl/messages/${this.id}`,
                headers: {"Authorization": `Kinvey ${autToken}`},
                success: deleteMsgSuccess,
                error: handleAjaxError
            });

            function deleteMsgSuccess(data) {
                showInfo('Delete message successful.');
                showArchiveView();
            }
        }
    }
}

function formatDate(dateISO8601) {
    let date = new Date(dateISO8601);
    if (Number.isNaN(date.getDate()))
        return '';
    return date.getDate() + '.' + padZeros(date.getMonth() + 1) +
        "." + date.getFullYear() + ' ' + date.getHours() + ':' +
        padZeros(date.getMinutes()) + ':' + padZeros(date.getSeconds());

    function padZeros(num) {
        return ('0' + num).slice(-2);
    }
}

function showSendMessageView() {
    getAllUsers();

    showView('viewSendMessage');
}

function getAllUsers() {
    $('#msgRecipientUsername').find('option').remove(); // clear before all
    $('#msgText').val("");

    let username = sessionStorage.getItem('username');
    let authToken = sessionStorage.getItem('authToken');

    $.ajax({
        method: "GET",
        url: baseUrl + "user/" + appKey,
        headers: {"authorization" : `Kinvey ${authToken}`},
        success: showAllUsers,
        error: handleAjaxError
    });

    function showAllUsers(users) {
        for (let user of users){
            let username = user.username;

            if(user.name != "")
                username += ` (${user.name})`;

            username = htmlEscaping(username);

            $('#msgRecipientUsername').append(`<option>${username}</option>`)
        }
    }
}

function showInfo(message) {
    $('#infoBox').text(message);
    $('#infoBox').show();

    setTimeout(function () {
        $('#infoBox').fadeOut();
    }, 3000);
}

function showError(error) {
    $('#errorBox').text("Error: " + error);
    $('#errorBox').show();
}

function addListenersForm(){
    login();
    register();
    sendMail();

    function login() {
        $('#formLogin').submit(function (event) {
            event.preventDefault();

            let username = $('#loginUsername').val();
            let password = $('#loginPasswd').val();

            let userData = {
                "username": username,
                "password": password
            };

            $.ajax({
                method: "POST",
                url: baseUrl + "user/" + appKey + "/login",
                headers: appAuthHeaders,
                data: userData,
                success: loginSuccess,
                error: handleAjaxError
            });

            function loginSuccess(userInfo) {
                saveInfoUser(userInfo);
                showInfo('Login successful');
            }
        })
    }

    function register() {
        $('#formRegister').submit(function (event) {
            event.preventDefault(); // prevent the submit

            let username = $('#registerUsername').val();
            let password = $('#registerPasswd').val();
            let registerName = $('#registerName').val();

            let userData = {
                "username": username,
                "password": password,
                "name": registerName
            };

            $.ajax({
                method: "POST",
                url: baseUrl + "user/" + appKey + "/",
                headers: appAuthHeaders,
                data: userData,
                success: registerSuccess,
                error: handleAjaxError
            });

            function registerSuccess(userInfo) {
                saveInfoUser(userInfo);
                showInfo('User registration successful');
            }
        });
    }

    function saveInfoUser(userInfo) {
        saveAuthToken(userInfo);
        showHideMenuLinks();
        $('#viewUserHomeHeading').text(`Welcome, ${userInfo.username}!`);
        showView('viewUserHome');
    }

    function sendMail() {
        $('#formSendMessage').submit(function (event) {
            event.preventDefault();

            let to = $('#msgRecipientUsername').val().split(' ')[0];
            let text = $('#msgText').val();

            let data = {
                "sender_username": sessionStorage.getItem('username'),
                "sender_name": sessionStorage.getItem('name'),
                "recipient_username": to,
                "text": text
            };

            $.ajax({
                method: "POST",
                url: baseUrl + "appdata/" + appKey + "/messages",
                headers: {"authorization": 'Kinvey ' + sessionStorage.getItem('authToken')},
                data: data,
                success: sendMsgSuccess,
                error: handleAjaxError
            });

            function sendMsgSuccess(info) {
                showInfo('Message sended.');
                showArchiveView();
            }
        })
    }
}

function saveAuthToken(userInfo) {
    sessionStorage.setItem('authToken', userInfo._kmd.authtoken);
    sessionStorage.setItem('userId', userInfo._id);
    sessionStorage.setItem('username', userInfo.username);

    if(userInfo.name != "")
        sessionStorage.setItem("name", userInfo.name);

    $('#spanMenuLoggedInUser').text(`Welcome, ${userInfo.username}!`);
    $('#spanMenuLoggedInUser').show();
}

function handleAjaxError(response) {
    let errorMsg = JSON.stringify(response);

    if(response.readyState == 0)
        errorMsg = "Due to connect to network";

    if(response.responseJSON && response.responseJSON.description)
        errorMsg = response.responseJSON.description;

    showError(errorMsg);
}

function logoutUser() {
    let authtoken = "Kinvey " + sessionStorage.getItem('authToken');
    console.log(authtoken);

    $.ajax({
        method: "POST",
        url: "https://baas.kinvey.com/user/kid_rJt70ucXl/_logout",
        headers: {"authorization" : authtoken},
        success: logoutSuccess,
        error: handleAjaxError
    });

    function logoutSuccess(userInfo) {
        sessionStorage.clear();
        showHomeView();
        showHideMenuLinks();
        showInfo("Logout successful.");
    }
}

function htmlEscaping(text) {
    var tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };

    function replaceTag(tag) {
        return tagsToReplace[tag] || tag;
    }

    return text.replace(/[&<>]/g, replaceTag);
}
