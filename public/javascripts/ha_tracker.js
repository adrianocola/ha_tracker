app = window.app ? window.app : {};

//TODO
//IMPLEMENTAR AUTO-LOGIN (keep me logged) - FEITO PORCAMENTE! REVISAR!
//IMPLEMENTAR CONTROLE DE SESSÃO COM REDIS
//IMPLEMENTAR spin quando adiciona enemy ou game
//IMPLEMENTAR LOGIN COM FACEBOOK E CONTAGEM DE LIKE E +1
//IMPLEMENTAR BOOKMARK COM HISTÓRICO

//IMPLEMENTAR MODO SEM LOGIN, COM STORAGE LOCAL
//IMPLEMENTAR "forgot password"
//IMPLEMENTAR CAPTCHA de criação de usuário (ou algo do tipo, pra não existir spam)
//IMPLEMENTAR purge de AUTO-LOGIN (keep me logged in)

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

        //var cont = 0;

        FB.getLoginStatus(function(response) {

            if(response.status=="connected")
            {
                app.FB_AccessToken = response.authResponse.accessToken;

                console.log("The user is logged in and has authenticated your app");
                if($("#is_logged").length == 0){

                    app.LoginView.model.login_facebook(response.authResponse.userID
                        ,response.authResponse.accessToken
                        ,response.authResponse.expiresIn
                        ,true,function(err){

                            console.log(err);
                            if(!err){
                                app.SignupView.logged();
                            }

                        });
                }

//


            } else if (response.status === 'not_authorized') {
                console.log("The user is logged in to Facebook, but has not authenticated your app");
            } else {
                console.log("The user isn't logged in to Facebook");
            }
        });

//        FB.Event.subscribe('auth.statusChange', function(response){
//            console.log("MUDOU STATUS: " + response.status);
//        });

        //executed when the user tries to login or signup or is already authenticated in facebook
//        FB.Event.subscribe('auth.statusChange', function(response){
//            FB.Event.unsubscribe('auth.statusChange');
//            //auth.authResponseChange
//            console.log(response.authResponse);
//
//            if(response.status=="connected")
//            {
//                console.log("The user is logged in and has authenticated your app");
//                if($("#is_logged").length == 0){
//
//                    app.LoginView.model.login_facebook(response.authResponse.userID
//                        ,response.authResponse.accessToken
//                        ,response.authResponse.expiresIn
//                        ,true,function(err){
//
//                        console.log(err);
//                        if(!err){
//                            app.SignupView.logged();
//                        }
//
//                    });
//                }
//
////
//
//
//            } else if (response.status === 'not_authorized') {
//                console.log("The user is logged in to Facebook, but has not authenticated your app");
//            } else {
//                console.log("The user isn't logged in to Facebook");
//            }
//
//            //cont += 1;
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
    app.LoginView.render().initial_dismiss();

    //render the signup view
    app.SignupView.render().initial_dismiss();


    //verify if server thinks client is connect
    if($("#is_logged").length > 0){
        //tries to login
        app.LoginView.model.login("","",false,function(err){
            if(err){
                app.LoginView.show();
            }else{
                //if it' NOT a facebook try to login, else let the facebook try to login
                if(!app.LoginView.model.toJSON().facebook){
                    new app.LoggedPlayerView({model: app.LoginView.model });
                }else{
                    app.LoginView.show();
                }
            }
        });
    }else{
        app.LoginView.show();
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