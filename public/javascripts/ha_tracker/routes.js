app = window.app ? window.app : {};


var GameRouter = Backbone.Router.extend({

    routes: {

        ":enemyName/:gameNum": "selectGame"
    },

    selectGame: function(enemyName, gameNum){
        console.log( 'COISA');

        this.selectedEnemy = enemyName;
        this.selectedGame = gameNum;

        //app.AppPlayer.selectGame(enemyName,gameNum);
    }

});
