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
//IMPLEMENTAR purge de AUTO-LOGIN (keep me logged in)


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

        FB.Event.subscribe('auth.login', function(response){
            console.log(response);
        });

        FB.Event.subscribe('auth.authResponseChange', function(response) {


            if(response.status=="connected")
            {

                //document.getElementById("fblogin").value=response.authResponse.userID;
                console.log("The user is logged in and has authenticated your app");
                console.log(response.authResponse.accessToken);


                app.LoginView.login_facebook(response.authResponse.userID,response.authResponse.accessToken,response.authResponse.expiresIn);


            } else if (response.status === 'not_authorized') {
                console.log("The user is logged in to Facebook, but has not authenticated your app");
            } else {
                console.log("The user isn't logged in to Facebook");
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