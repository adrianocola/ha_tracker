app = window.app ? window.app : {};


$(function(){


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



    var selectedGameView = app.SelectedGameView;

    app.AppPlayer = new app.Player({name: "Player"});
    app.AppPlayer.fetch({success: function(){

        app.Login.render();

        app.AppPlayer.loadEnemies();

        new app.PlayerView({model: app.AppPlayer}).render();

        selectedGameView.render();

        app.GameRouter = new GameRouter();
        Backbone.history.start({pushState: true});

    }});



});