app = window.app ? window.app : {};


$(function(){

    var selectedGameView = app.SelectedGameView;

    app.AppPlayer = new app.Player({name: "Player"});
    app.AppPlayer.fetch();

    new app.PlayerView({model: app.AppPlayer});

    selectedGameView.render();


    app.AppPlayer.enemies.bind("reset",function(){
        app.GameRouter = new GameRouter();
        Backbone.history.start({pushState: true});
    });

});