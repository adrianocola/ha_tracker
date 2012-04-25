app = window.app ? window.app : {};


var GameRouter = Backbone.Router.extend({

    routes: {

        "enemies/:enemyId/games/:gameId": "selectGame"
    },

    selectGame: function(enemyId, gameId){
        console.log( app.AppPlayer);
        app.AppPlayer.selectGame(enemyId,gameId);



    }

});
