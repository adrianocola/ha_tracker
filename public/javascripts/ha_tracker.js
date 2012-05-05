app = window.app ? window.app : {};


$(function(){


//    To use backbone with parse.com without a proxy
//    var originalSync = Backbone.sync;
//
//    Backbone.sync = function(method, model, options) {
//
//        options = options || {};
//
//        headers = options.headers || {};
//
//        headers['X-Parse-Application-Id'] = 'Dr6iAUoZAHZawPm7b9zAhcP5gBFfXO6hy6tJdel7';
//        headers['X-Parse-REST-API-Key'] = 'cx7WZFrRTuKLJdHZqdv6OTs853W1Uv8lqFGC2JRR';
//        headers['Content-Type'] = 'application/json';
//
//        options.headers = headers;
//
//        originalSync(method, model, options);
//
//    };

    //Facebook authentication
    window.fbAsyncInit = function() {
        FB.init({
            appId      : '349808971750591',
            status     : true,
            cookie     : true,
            xfbml      : true,
            oauth      : true
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

    //var player = new app.Player({username: "Player", password: "Teste"});
//    var player = new app.Player({objectId: "k5P9Llhx4d"});
//    player.fetch({success: function(){
//        console.log(player.toJSON());
//    }});

    //player.save();

    $.ajax("/api/login?username=teste6&password=teste")
        .success(function (data){

            var selectedGameView = app.SelectedGameView;

            app.Login.render();

            console.log(data);

            app.AppPlayer = new app.Player(data);
            //app.AppPlayer.fetch({success: function(){

                app.AppPlayer.loadEnemies();

                new app.PlayerView({model: app.AppPlayer}).render();

                selectedGameView.render();

                app.GameRouter = new GameRouter();
                Backbone.history.start({pushState: true});

            //}});


        });

});