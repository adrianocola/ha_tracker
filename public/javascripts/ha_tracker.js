app = window.app ? window.app : {};


$(function(){

    var selectedGameView = app.SelectedGameView;

    app.AppPlayer = new app.Player({name: "Player"});
    app.AppPlayer.fetch({success: function(){

        app.AppPlayer.loadEnemies();

        new app.PlayerView({model: app.AppPlayer}).render();

        selectedGameView.render();

        app.GameRouter = new GameRouter();
        Backbone.history.start({pushState: true});

    }});



});