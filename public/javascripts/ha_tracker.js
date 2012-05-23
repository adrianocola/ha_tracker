app = window.app ? window.app : {};

//TODO
//CRIAR MIDDLEWARES de deleçao automática de modelos no mongoose
//FAZER as funções de login do LoginModel devolverem um modelo de Player.
    // Organizar melhor essa parte. A view tá fazendo coisa que não é dela
    // Quem deveria ter essa parte no server? User ou Player?
//IMPLEMENTAR "reset account"
//IMPLEMENTAR "forgot password"
//IMPLEMENTAR "change password" (para usuários com e-mail)

//ARRUMAR SPINNERS, para que tenham regras de CSS que envolvam o pai
//COLOCAR algum timer que verifica se o login não apareceu, mostrá-lo na força. Mexer no setTimout lá embaixo

//IMPLEMENTAR BOOKMARK COM HISTÓRICO
//IMPLEMENTAR MODO SEM LOGIN, COM STORAGE LOCAL
//IMPLEMENTAR purge de AUTO-LOGIN (keep me logged in)
//ARRUMAR layouts, css
//ARRUMAR interferencia de logins. Se tiver marcado keep signed in e facebook juntos pode zuar


//variable to control the login flow. There are 2 types of login:
//email and facebook. Each attempt of login by one of those mettods
//add 1 to the verified_login_count variable. The last one to add
//is responsible to open the login panel, if there was no successsful login
var verified_login_count = 0;

function tryOpenLoginPanel(){
    if(verified_login_count>0){
        app.LoginView.show();
    }else{
        verified_login_count += 1;
    }
};


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

                console.log("The user is logged in and has authenticated your app");


                if(app.LoggedPlayerView.model == undefined){

                    app.LoginView.model.login_facebook(response.authResponse.userID
                        ,response.authResponse.accessToken
                        ,response.authResponse.expiresIn
                        ,true,function(err){

                            console.log(err);
                            if(!err){
                                app.LoginView.dismiss();
                                app.CurrentPlayerView = new app.LoggedPlayerView({model: app.LoginView.model });

                            }else{
                                tryOpenLoginPanel();
                            }

                        });
                }else{
                    tryOpenLoginPanel();
                }

            } else if (response.status === 'not_authorized') {
                tryOpenLoginPanel();
                console.log("The user is logged in to Facebook, but has not authenticated your app");
            } else {
                tryOpenLoginPanel();
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
    app.LoginView.render_loading();//.initial_dismiss();

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
                    app.LoginView.dismiss();
                    app.CurrentPlayerView =  new app.LoggedPlayerView({model: app.LoginView.model });
                }else{
                    tryOpenLoginPanel();
                }
            }
        });
    }else{
        tryOpenLoginPanel();
    }

    //app.LoginView.login();
    //}

    var selectedGameView = app.SelectedGameView;
    selectedGameView.render();

    app.GameRouter = new GameRouter();
    Backbone.history.start({pushState: true});

    //verify if after some seconds the login screen was shown or not
    setTimeout(function(){
        //if the login is NOT visible (is loading) and there is no player defined
        if(!app.LoginView.visible && app.CurrentPlayerView == undefined){
            app.LoginView.initial_dismiss();
            app.LoginView.show();
        }
    },5000);


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