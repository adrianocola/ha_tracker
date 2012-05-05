app = window.app ? window.app : {};


var Council = {
    raceName: "Council",
    raceTitle: "/images/council.png",
    raceIcon: "/images/council_icon.png"
}

var DarkElves = {
    raceName: "Dark Elves",
    raceTitle: "/images/darkelves.png",
    raceIcon: "/images/darkelves_icon.png"
}

var Dwarves = {
    raceName: "Dwarves",
    raceTitle: "/images/dwarves.png",
    raceIcon: "/images/dwarves_icon.png"
}

var Tribe = {
    raceName: "Tribe",
    raceTitle: "/images/tribe.png",
    raceIcon: "/images/tribe_icon.png"
}

var Races = [Council, DarkElves, Dwarves, Tribe];


var Item = Backbone.Model.extend({

    idAttribute: "_id",

    initialize: function(){

        _.bindAll(this);

    },

    addCount: function(){
       var sum = this.get("itemCount")+1;
       if(sum > this.get("itemCountMax")){
           this.set("itemCount",0);
       }else{
           this.set("itemCount",sum);
       }

        this.save();

    },

    subCount: function(){
        var sub = this.get("itemCount")-1;
        if(sub < 0){
            this.set("itemCount",this.get("itemCountMax"));
        }else{
            this.set("itemCount",sub);
        }

        this.save();

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
    model: Item,

    url: function(){
        return '/api/itemmanager/' + this.itemsId + '/items';
    },

    initialize: function(itemsId){

        this.itemsId = itemsId;

    },

    remaining: function(){

        var count = 0;

        this.each(function(item){
            count += item.get("itemCount");
        },this);

        return count;

    }

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

        var playerRace = _.find(Races, function(race){ return race.raceName === this.get("playerRace")},this);
        this.set("playerRaceIcon",playerRace.raceIcon);
        this.set("playerRaceTitle",playerRace.raceTitle);

        var enemyRace = _.find(Races, function(race){ return race.raceName === this.get("enemyRace")},this);
        this.set("enemyRaceIcon",enemyRace.raceIcon);
        this.set("enemyRaceTitle",enemyRace.raceTitle);


        //if the model is comming from the server it already have
        // the playerItems and enemyItems ids
        if(!this.isNew()){
            this.playerItems = new Items(this.get('playerItems'));
            this.enemyItems = new Items(this.get('enemyItems'));
        }else{
            //if the game is being created in the client it must
            // wait the server return with the playerItems and enemyItems id
            this.bind("sync",function(){
                this.playerItems = new Items(this.get('playerItems'));
                this.enemyItems = new Items(this.get('enemyItems'));
            },this);
        }





    },

    select: function(){

        this.playerItems.fetch();

        this.enemyItems.fetch();
    }

});

var Games = Backbone.Collection.extend({
    model: Game,
    url: function(){
        return "/api/enemies/" + this.enemy.id + "/games";
    },

    select: function(gameId){


        app.GameRouter.navigate(this.enemy.get('name') +  "/" + this.get(gameId).get("num"));

        app.SelectionManager.setSelectedEnemy(this.enemy);
        app.SelectionManager.setSelectedGame(this.get(gameId));

    }


});


var Enemy = Backbone.Model.extend({

    idAttribute: "_id",

    initialize: function(){

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

        _.bindAll(this);

    },


    loadEnemies: function(){
        this.enemies = new app.Enemies(this.get('enemies'));
    },

    selectGame: function(enemyId, gameId){

        //this.enemies.get(enemyId).selectGame(gameId);

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