app = window.app ? window.app : {};



var Item = Backbone.Model.extend({

    idAttribute: "_id",
    urlRoot: "/api/items",

    initialize: function(){

        if(!this.get("itemCount")){
            this.set("itemCount", this.get("itemCountMax"));
        }

        _.bindAll(this);

    },

    addCount: function(){
       this.save("itemCount",this.get("itemCount")+1);
    },

    subCount: function(){
        this.save("itemCount",this.get("itemCount")-1);
    },

    canAdd: function(){
        return this.get("itemCount")===this.get("itemCountMax")?false:true;
    },

    canSub: function(){
        return this.get("itemCount")===0?false:true;
    },

    validate: function(attrs){
        if(attrs.itemCount > attrs.itemCountMax){
            return "Cannot have more than " + attrs.itemCountMax + " of item " + attrs.itemName + "!";
        }

        if(attrs.itemCount < 0){
            return "Cannot have more less than 0 of item " + attrs.itemName + "!";
        }
    }



});


var Items = Backbone.Collection.extend({
    model: Item
});

var SelectionManager = Backbone.Model.extend({

    initialize: function(){

        this.selectedEnemy = undefined;
        this.selectedGame = undefined;

        _.bindAll(this);

    },

    unselectCurrentGame: function(){

        if(this.selectedGame){
            this.selectedGame.off("destroy",this.unselectCurrentGame,this);
            this.selectedGame.trigger("change:unselected");
        }
        this.trigger("change:unselectedGame",this.selectedGame);
        this.selectedGame = undefined;
    },

    unselectCurrentEnemy: function(){
        if(this.selectedEnemy){
            //console.log("DESCADASTROU!");
            this.selectedEnemy.off("destroy",this.unselectCurrentEnemy,this);
            this.selectedEnemy.trigger("change:unselected");
        }
        this.trigger("change:unselectedEnemy",this.selectedEnemy);
        this.selectedEnemy = undefined;

    },

    setSelectedGame: function(game){
        this.unselectCurrentGame();

        this.selectedGame = game;
        this.selectedGame.trigger("change:selected");
        this.trigger("change:selectedGame",game);
        this.selectedGame.select();

        this.selectedGame.bind("destroy",this.unselectCurrentGame,this);
    },

    setSelectedEnemy: function(enemy){
        this.unselectCurrentEnemy();

        this.selectedEnemy = enemy;
        this.selectedEnemy.trigger("change:selected");
        this.trigger("change:selectedEnemy",enemy);

        this.selectedEnemy.bind("destroy",this.unselectCurrentEnemy,this);
        //console.log("ENEMY: " + enemy.id);
        this.selectedEnemy.bind("destroy",function(){
            //console.log("DESTROY ENEMY: " + enemy.id);
        },this);
    }

});


var Game = Backbone.Model.extend({

    idAttribute: "_id",

    defaults:{
        name: "",
        playerRace: "Council",
        enemyRace: "Council"
    },

    initialize: function(){

        this.selected = false;

        this.playerItems = new Items();
        this.enemyItems = new Items();



    },

    select: function(){

        this.loadItems();
    },

    loadItems: function(){

        _.each(this.get("playerItems"),function(itemId){
            var item = new app.Item({_id: itemId});

            item.fetch();

            this.playerItems.add(item);

        },this);

        _.each(this.get("enemyItems"),function(itemId){
            var item = new app.Item({_id: itemId});
            item.fetch();

            this.enemyItems.add(item);

        },this);

        this.playerItems.trigger("loaded");
        this.enemyItems.trigger("loaded");

    }



});

var Games = Backbone.Collection.extend({
    model: Game,
    url: function(){
        return "/api/enemies/" + this.enemy.id + "/games";
    },

    select: function(gameId){

        app.GameRouter.navigate("enemies/" + this.enemy.id +  "/games/" + gameId);

//        if(app.SelectedGame){
//            app.SelectedGame.trigger("change:unselected");
//        }

        app.SelectionManager.setSelectedEnemy(this.enemy);
        app.SelectionManager.setSelectedGame(this.get(gameId));

//        app.SelectedGame = this.get(gameId);
//        app.SelectedGame.select();
//        app.SelectedGame.trigger("change:selected");


    }


});


var Enemy = Backbone.Model.extend({

    idAttribute: "_id",

    initialize: function(){
        //esquema feito para aceitar uma collection de games dentro do modelo de Enemy.
        //isso também permite salvar o enemy inteiro
        //não confundir a variável this.collection com this.get('games')

        this.games = new Games(this.get('games'));
        this.games.enemy = this;


        this.games.bind("change:selected",function(){
            this.trigger("change:selected");
        },this);
    },

    selectGame: function(gameId){

        this.games.select(gameId);

    }

});

var Enemies = Backbone.Collection.extend({

    model: Enemy,
    url: "/api/enemies"


});

var Player = Backbone.Model.extend({

    idAttribute: "name",

    urlRoot: "/api/players",

    initialize: function(){

        this.enemies = new app.Enemies();

        //quando carregar o player, carrega os enemies
        this.bind("change",function(){
            this.off("change");
            this.enemies.fetch();
        },this);

    },

    selectGame: function(enemyId, gameId){

        this.enemies.get(enemyId).selectGame(gameId);

    }


});

$(function(){

    app.Player = Player;
    app.Enemy = Enemy;
    app.Game = Game;
    app.Item = Item;

    app.Enemies = Enemies;
    app.Games = Games;
    app.Items = Items;

    app.SelectionManager = new SelectionManager();


});