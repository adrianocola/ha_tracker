app = window.app ? window.app : {};

//TODO
//IMPLEMENTAR AUTO-LOGIN (keep me logged) - FEITO PORCAMENTE! REVISAR!
//IMPLEMENTAR CONTROLE DE SESSÃO COM REDIS
//IMPLEMENTAR BOOKMARK COM HISTÓRICO
//IMPLEMENTAR LOGIN COM FACEBOOK E CONTAGEM DE LIKE E +1
//IMPLEMENTAR MODO SEM LOGIN, COM STORAGE LOCAL
//IMPLEMENTAR "forgot password"
//IMPLEMENTAR CAPTCHA de criação de usuário (ou algo do tipo, pra não existir spam)
//IMPLEMENTAR purge de AUTO-LOGIN (keep me logged in)
//IMPLEMENTAR spin quando adiciona enemy ou game
//ARRUMAR layouts, css
//ARRUMAR interferencia de logins. Se tiver marcado keep signed in e facebook juntos pode zuar





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


        //executed when the user tries to login or signup or is already authenticated in facebook
        FB.Event.subscribe('auth.statusChange', function(response){
            if(response.status=="connected")
            {
                console.log("The user is logged in and has authenticated your app");
                app.LoginView.model.login_facebook(response.authResponse.userID
                        ,response.authResponse.accessToken
                        ,response.authResponse.expiresIn
                        ,!app.LoginView.clickedFacebookStatus(),function(err){


                        if(!err){
                            app.LoginView.logged();
                        }

                    });


            } else if (response.status === 'not_authorized') {
                console.log("The user is logged in to Facebook, but has not authenticated your app");
            } else {
                console.log("The user isn't logged in to Facebook");
            }

        });

        //executed when the user tries to login or signup or is already authenticated in facebook
//        FB.Event.subscribe('auth.authResponseChange', function(response){
//            console.log('auth.authResponseChange');
//            if(response.status=="connected")
//            {
//                console.log("The user is logged in and has authenticated your app");
//                app.LoginView.login_facebook(response.authResponse.userID,response.authResponse.accessToken,response.authResponse.expiresIn);
//
//
//            } else if (response.status === 'not_authorized') {
//                console.log("The user is logged in to Facebook, but has not authenticated your app");
//            } else {
//                console.log("The user isn't logged in to Facebook");
//            }
//
//        });

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

    //render the signup view
    app.SignupView.render().dismiss();


    //if have "Keep me logged in" cookies, try to login with them
    //if(cookies.readCookie('KEEP_LOGGED_USER') && cookies.readCookie('KEEP_LOGGED_ID')){
    if($("#is_logged")){
        //app.LoginView.login();
        console.log("TENTA LOGAR");
        app.LoginView.model.login("","",false,function(err){
            console.log(err);
            if(!err){
                app.LoginView.logged();
            }
        });
    }

    //app.LoginView.login();
    //}

    var selectedGameView = app.SelectedGameView;
    selectedGameView.render();

    app.GameRouter = new GameRouter();
    Backbone.history.start({pushState: true});


//    PRECISO VERIFICAR APÓS O LOGIN SE TEM ALGO NO ROUTER E ENTÃO PEDIR
//    PRA SELECIONAR O GAME DO ROUTER
//    OU O ROUTER PODERIA DISPARAR O LOGIN, JÁ QUE PRA ACESSAR O LINK
//    É PRECISO ESTAR LOGADO
    //checks is the routers is telling that the current selected game
    // is one of this enemy
//    if(app.GameRouter.selectedEnemy == this.model.get('name')){
//        this.model.games.each(function(game){
//            if(game.get('num') == app.GameRouter.selectedGame){
//                //ESTOU ACHANDO O GAME CERTO PARA SELECIONA MAS NÃO CONSIGO
//                //ACHO QUE A VIEW NÃO ESTÁ LIGADA AINDA
//                console.log("ENEMY IGUAL");
//                this.model.games.select(game.get('_id'));
//                app.SelectedGameView.selected(game);
//            }
//
//        },this);
//        //console.log("ENEMY IGUAL");
//    }



});