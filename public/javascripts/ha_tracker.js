app = window.app ? window.app : {};


$(function(){

    var selectedGameView = app.SelectedGameView;

    app.AppPlayer = new app.Player({_id: "4f92a60eff8f8c0000000003"});
    app.AppPlayer.fetch();

    new app.PlayerView({model: app.AppPlayer});

    selectedGameView.render();


    app.AppPlayer.enemies.bind("reset",function(){
        app.GameRouter = new GameRouter();
        Backbone.history.start({pushState: true});
    });

});