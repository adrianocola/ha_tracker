app = window.app ? window.app : {};


var GameRouter = Backbone.Router.extend({

    routes: {

        ":enemyId/:gameId": "selectGame"
    },

    selectGame: function(enemyId, gameId){
        console.log( app.AppPlayer);
        app.AppPlayer.selectGame(enemyId,gameId);



    }

});
