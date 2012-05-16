app = window.app ? window.app : {};

//TODO
//IMPLEMENTAR AUTO-LOGIN (keep me logged) - FEITO PORCAMENTE! REVISAR!
//IMPLEMENTAR SEARCH
//IMPLEMENTAR CONTROLE DE SESSÃO COM REDIS
//IMPLEMENTAR BOOKMARK COM HISTÓRICO
//IMPLEMENTAR LOGIN COM FACEBOOK E CONTAGEM DE LIKE E +1
//IMPLEMENTAR MODO SEM LOGIN, COM STORAGE LOCAL
//IMPLEMENTAR "forgot password"
//IMPLEMENTAR CAPTCHA de criação de usuário (ou algo do tipo, pra não existir spam)


$(function(){



    //Facebook authentication
    window.fbAsyncInit = function() {
        FB.init({
            appId      : $('#facebook_app_id').html(),
            status     : true,
            cookie     : true,
            xfbml      : true,
            oauth      : true
        });

        FB.Event.subscribe('auth.authResponseChange', function(response) {
            if(response.status=="connected")
            {

                //document.getElementById("fblogin").value=response.authResponse.userID;
                console.log(response.authResponse.accessToken);

            }

        });

    };
    (function(d){
        var js, id = 'facebook-jssdk';
        if (d.getElementById(id)) {return;}

        js = d.createElement('script');
        js.id = id;
        js.async = true;
        js.src = "//connect.facebook.net/en_US/all.js";
        d.getElementsByTagName('head')[0].appendChild(js);
    }(document));




    //render the login view
    app.LoginView.render();

    //if have "Keep me logged in" cookies, try to login with them
    if(cookies.readCookie('KEEP_LOGGED_USER') && cookies.readCookie('KEEP_LOGGED_ID')){
        app.LoginView.login();
    }

    var selectedGameView = app.SelectedGameView;
    selectedGameView.render();

    app.GameRouter = new GameRouter();
    Backbone.history.start({pushState: true});



});