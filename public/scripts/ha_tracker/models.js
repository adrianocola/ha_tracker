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

        this.realItem = consts.Items[this.get('itemId')];

    },

    addCount: function(){
       var sum = this.get("itemCount")+1;
       if(sum > this.realItem.itemCountMax){
           this.set("itemCount",0);
       }else{
           this.set("itemCount",sum);
       }

    },

    subCount: function(){
        var sub = this.get("itemCount")-1;
        if(sub < 0){
            this.set("itemCount",this.realItem.itemCountMax);
        }else{
            this.set("itemCount",sub);
        }

    },

    canAdd: function(){
        return this.get("itemCount")===this.realItem.itemCountMax?false:true;
    },

    canSub: function(){
        return this.get("itemCount")===0?false:true;
    },

    validate: function(attrs){
        if(!this.realItem){
            return;
        }

        if(attrs.itemCount > this.realItem.itemCountMax){
            return "Cannot have more than " + this.realItem.itemCountMax + " of item " + attrs.itemName + "!";
        }

        if(attrs.itemCount < 0){
            return "Cannot have more less than 0 of item " + attrs.itemName + "!";
        }
    },

    formatToJSON: function(){

        var item = _.clone(this.realItem);
        item.itemCount = this.get('itemCount');
        return item;

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

    },

    parse: function(response){

        return response.data;

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
        this.active = true;

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

    validate: function(attrs){

        if(attrs.state < 0 || attrs.state > 8){
            return 'Invalid state';
        }

    },

    isWon: function(){
        if(this.get('state') >=1 && this.get('state') <=4) {
            return true;
        }else{
            return false;
        }
    },

    isLost: function(){
        if(this.get('state') >=5 && this.get('state') <=8) {
            return true;
        }else{
            return false;
        }
    },

    isInProgress: function(){
        if(this.get('state') == 0) {
            return true;
        }else{
            return false;
        }
    },


    select: function(){

        var that = this;

        this.playerItems.fetch({error: function(model, err){
            that.trigger('error',err);
        }});

        this.enemyItems.fetch({error: function(model, err){
            that.trigger('error',err);
        }});
    },

    isVisible: function(){

        return this.active;

    },

    showOnlyActive: function(showOnlyActive){

        if(showOnlyActive && this.get('state')==0){
            this.active = true;
        }else if(!showOnlyActive){
            this.active = true;
        }else{
            this.active = false;
        }

    }

});

var Games = Backbone.Collection.extend({
    model: Game,
    url: function(){
        return "/api/enemies/" + this.enemy.id + "/games";
    },

    select: function(gameId){

        //app.GameRouter.navigate("enemies/" + this.enemy.get('name') +  "/" + this.get(gameId).get("num"));

        app.SelectionManager.setSelectedEnemy(this.enemy);
        app.SelectionManager.setSelectedGame(this.get(gameId));

    },

    comparator: function(game){

        return -game.get('num');

    }


});


var Enemy = Backbone.Model.extend({

    idAttribute: "_id",

    initialize: function(){

        this.inFilter = true;
        this.visible = true;

        this.games = new Games(this.get('games'));
        this.games.enemy = this;
        this.active = true;


        this.games.bind("change:selected",function(){
            this.trigger("change:selected");
        },this);


    },

    selectGame: function(gameId){

        this.games.select(gameId);
    },

    setInFilter: function(inFilter){
        this.inFilter = inFilter;
    },

    isVisible: function(){
        if(this.inFilter && this.active){
            return true;
        }else{
            return false;
        }

    },

    showOnlyActive: function(showOnlyActive){

        this.games.each(function(game){
            game.showOnlyActive(showOnlyActive);
        });

        if(showOnlyActive){
            var isAnyGameVisible = this.games.any(function(game){ return game.active; });

            if(isAnyGameVisible){
                this.active = true;
            }else{
                this.active = false;
            }

        }else{
            this.active = true;
        }

    },

    statistics: function(){

        var stats = {
            name: this.get("name"),
            ratio: 0,
            inProgress: 0,
            wins:{
                total: 0,
                crystal: 0,
                heroes: 0,
                surrender: 0,
                timeout: 0
            },
            losses:{
                total: 0,
                crystal: 0,
                heroes: 0,
                surrender: 0,
                timeout: 0
            },
            council:{
                wins: 0,
                losses: 0,
                ratio: 0,
                council_wins: 0,
                council_losses: 0,
                council_ratio: 0,
                darkelves_wins: 0,
                darkelves_losses: 0,
                darkelves_ratio: 0,
                dwarves_wins: 0,
                dwarves_losses: 0,
                dwarves_ratio: 0,
                tribe_wins: 0,
                tribe_losses: 0,
                tribe_ratio: 0
            },
            darkelves:{
                wins: 0,
                losses: 0,
                ratio: 0,
                council_wins: 0,
                council_losses: 0,
                council_ratio: 0,
                darkelves_wins: 0,
                darkelves_losses: 0,
                darkelves_ratio: 0,
                dwarves_wins: 0,
                dwarves_losses: 0,
                dwarves_ratio: 0,
                tribe_wins: 0,
                tribe_losses: 0,
                tribe_ratio: 0
            },
            dwarves:{
                wins: 0,
                losses: 0,
                ratio: 0,
                council_wins: 0,
                council_losses: 0,
                council_ratio: 0,
                darkelves_wins: 0,
                darkelves_losses: 0,
                darkelves_ratio: 0,
                dwarves_wins: 0,
                dwarves_losses: 0,
                dwarves_ratio: 0,
                tribe_wins: 0,
                tribe_losses: 0,
                tribe_ratio: 0
            },
            tribe:{
                wins: 0,
                losses: 0,
                ratio: 0,
                council_wins: 0,
                council_losses: 0,
                council_ratio: 0,
                darkelves_wins: 0,
                darkelves_losses: 0,
                darkelves_ratio: 0,
                dwarves_wins: 0,
                dwarves_losses: 0,
                dwarves_ratio: 0,
                tribe_wins: 0,
                tribe_losses: 0,
                tribe_ratio: 0
            }

        };

        this.games.each(function(game){
            var gameState = game.get('state');


            switch(game.get('state')){
                case 0: stats.inProgress = stats.inProgress + 1;
                        break;
                case 1: stats.wins.crystal = stats.wins.crystal + 1;
                        break;
                case 2: stats.wins.heroes = stats.wins.heroes + 1;
                        break;
                case 3: stats.wins.surrender = stats.wins.surrender + 1;
                        break;
                case 4: stats.wins.timeout = stats.wins.timeout + 1;
                        break;
                case 5: stats.losses.crystal = stats.losses.crystal + 1;
                        break;
                case 6: stats.losses.heroes = stats.losses.heroes + 1;
                        break;
                case 7: stats.losses.surrender = stats.losses.surrender + 1;
                        break;
                case 8: stats.losses.timeout = stats.losses.timeout + 1;
                        break;
            }

            if(game.get('state')==0) return;


            var playerRace = "";
            var enemyRace = "";


            switch(game.get('playerRace')){
                case 'Council': playerRace = "council";
                    break;
                case 'Dark Elves': playerRace = "darkelves";
                    break;
                case 'Dwarves': playerRace = "dwarves";
                    break;
                case 'Tribe': playerRace = "tribe";
                    break;
            }

            switch(game.get('enemyRace')){
                case 'Council': enemyRace = "council";
                    break;
                case 'Dark Elves': enemyRace = "darkelves";
                    break;
                case 'Dwarves': enemyRace = "dwarves";
                    break;
                case 'Tribe': enemyRace = "tribe";
                    break;
            }

            var win_or_lost = "";

            if(game.isWon()){
                stats.wins.total = stats.wins.total + 1;
                stats[playerRace].wins += 1;

                win_or_lost = "_wins";

            }else if(game.isLost()){
                stats.losses.total = stats.losses.total + 1;
                stats[playerRace].losses += 1;

                win_or_lost = "_losses";
            }

            stats[playerRace][enemyRace + win_or_lost] += 1;

        });

        stats.ratio = stats.wins.total / (stats.wins.total + stats.losses.total) * 100 || 0;

        stats.council.ratio = stats.council.wins / (stats.council.wins + stats.council.losses) * 100 || 0;
        stats.council.council_ratio = stats.council.council_wins / (stats.council.council_wins + stats.council.council_losses) * 100 || 0;
        stats.council.darkelves_ratio = stats.council.darkelves_wins / (stats.council.darkelves_wins + stats.council.darkelves_losses) * 100 || 0;
        stats.council.dwarves_ratio = stats.council.dwarves_wins / (stats.council.dwarves_wins + stats.council.dwarves_losses) * 100 || 0;
        stats.council.tribe_ratio = stats.council.tribe_wins / (stats.council.tribe_wins + stats.council.tribe_losses) * 100 || 0;

        stats.darkelves.ratio = stats.darkelves.wins / (stats.darkelves.wins + stats.darkelves.losses) * 100 || 0;
        stats.darkelves.council_ratio = stats.darkelves.council_wins / (stats.darkelves.council_wins + stats.darkelves.council_losses) * 100 || 0;
        stats.darkelves.darkelves_ratio = stats.darkelves.darkelves_wins / (stats.darkelves.darkelves_wins + stats.darkelves.darkelves_losses) * 100 || 0;
        stats.darkelves.dwarves_ratio = stats.darkelves.dwarves_wins / (stats.darkelves.dwarves_wins + stats.darkelves.dwarves_losses) * 100 || 0;
        stats.darkelves.tribe_ratio = stats.darkelves.tribe_wins / (stats.darkelves.tribe_wins + stats.darkelves.tribe_losses) * 100 || 0;

        stats.dwarves.ratio = stats.dwarves.wins / (stats.dwarves.wins + stats.dwarves.losses) * 100 || 0;
        stats.dwarves.council_ratio = stats.dwarves.council_wins / (stats.dwarves.council_wins + stats.dwarves.council_losses) * 100 || 0;
        stats.dwarves.darkelves_ratio = stats.dwarves.darkelves_wins / (stats.dwarves.darkelves_wins + stats.dwarves.darkelves_losses) * 100 || 0;
        stats.dwarves.dwarves_ratio = stats.dwarves.dwarves_wins / (stats.dwarves.dwarves_wins + stats.dwarves.dwarves_losses) * 100 || 0;
        stats.dwarves.tribe_ratio = stats.dwarves.tribe_wins / (stats.dwarves.tribe_wins + stats.dwarves.tribe_losses) * 100 || 0;

        stats.tribe.ratio = stats.tribe.wins / (stats.tribe.wins + stats.tribe.losses) * 100 || 0;
        stats.tribe.council_ratio = stats.tribe.council_wins / (stats.tribe.council_wins + stats.tribe.council_losses) * 100 || 0;
        stats.tribe.darkelves_ratio = stats.tribe.darkelves_wins / (stats.tribe.darkelves_wins + stats.tribe.darkelves_losses) * 100 || 0;
        stats.tribe.dwarves_ratio = stats.tribe.dwarves_wins / (stats.tribe.dwarves_wins + stats.tribe.dwarves_losses) * 100 || 0;
        stats.tribe.tribe_ratio = stats.tribe.tribe_wins / (stats.tribe.tribe_wins + stats.tribe.tribe_losses) * 100 || 0;
        

        return stats;

    }



});

var Enemies = Backbone.Collection.extend({

    model: Enemy,
    url: "/api/enemies",

    filter: function(key){

        this.each(function(enemy){
            //contains key
            if(enemy.get('name').toLowerCase().indexOf(key)!=-1){
                enemy.setInFilter(true);

            //not contains key
            }else{
                enemy.setInFilter(false);
            }


        },this);

    },

    comparator: function(enemy){

        return enemy.get('position');

    },

    //verify if exists an enemy with the same name
    exists: function(enemyName){

        if(enemyName){
            enemyName = enemyName.toLowerCase();
            return this.find(function(enemy){return enemy.get('name').toLowerCase() == enemyName })? true : false;
        }

        return true;


    },

    showOnlyActive: function(showOnlyActive){

        this.each(function(enemy){
            enemy.showOnlyActive(showOnlyActive);
        });
    },

    statistics: function(){

        var stats = {
            enemiesStats: [],
            inProgress: 0,
            wins:{
                total: 0,
                crystal: 0,
                heroes: 0,
                surrender: 0,
                timeout: 0
            },
            losses:{
                total: 0,
                crystal: 0,
                heroes: 0,
                surrender: 0,
                timeout: 0
            },
            council:{
                wins: 0,
                losses: 0,
                ratio: 0,
                council_wins: 0,
                council_losses: 0,
                council_ratio: 0,
                darkelves_wins: 0,
                darkelves_losses: 0,
                darkelves_ratio: 0,
                dwarves_wins: 0,
                dwarves_losses: 0,
                dwarves_ratio: 0,
                tribe_wins: 0,
                tribe_losses: 0,
                tribe_ratio: 0
            },
            darkelves:{
                wins: 0,
                losses: 0,
                ratio: 0,
                council_wins: 0,
                council_losses: 0,
                council_ratio: 0,
                darkelves_wins: 0,
                darkelves_losses: 0,
                darkelves_ratio: 0,
                dwarves_wins: 0,
                dwarves_losses: 0,
                dwarves_ratio: 0,
                tribe_wins: 0,
                tribe_losses: 0,
                tribe_ratio: 0
            },
            dwarves:{
                wins: 0,
                losses: 0,
                ratio: 0,
                council_wins: 0,
                council_losses: 0,
                council_ratio: 0,
                darkelves_wins: 0,
                darkelves_losses: 0,
                darkelves_ratio: 0,
                dwarves_wins: 0,
                dwarves_losses: 0,
                dwarves_ratio: 0,
                tribe_wins: 0,
                tribe_losses: 0,
                tribe_ratio: 0
            },
            tribe:{
                wins: 0,
                losses: 0,
                ratio: 0,
                council_wins: 0,
                council_losses: 0,
                council_ratio: 0,
                darkelves_wins: 0,
                darkelves_losses: 0,
                darkelves_ratio: 0,
                dwarves_wins: 0,
                dwarves_losses: 0,
                dwarves_ratio: 0,
                tribe_wins: 0,
                tribe_losses: 0,
                tribe_ratio: 0
            }

        };


        this.each(function(enemy){
            var enemyStats = enemy.statistics();

            stats.enemiesStats.push(enemyStats);

            stats.inProgress += enemyStats.inProgress;
                
            stats.wins.total += enemyStats.wins.total;
            stats.wins.crystal += enemyStats.wins.crystal;
            stats.wins.heroes += enemyStats.wins.heroes;
            stats.wins.surrender += enemyStats.wins.surrender;
            stats.wins.timeout += enemyStats.wins.timeout;

            stats.losses.total += enemyStats.losses.total;
            stats.losses.crystal += enemyStats.losses.crystal;
            stats.losses.heroes += enemyStats.losses.heroes;
            stats.losses.surrender += enemyStats.losses.surrender;
            stats.losses.timeout += enemyStats.losses.timeout;

            stats.council.wins += enemyStats.council.wins;
            stats.council.losses += enemyStats.council.losses;
            stats.council.council_wins += enemyStats.council.council_wins;
            stats.council.council_losses += enemyStats.council.council_losses;
            stats.council.darkelves_wins += enemyStats.council.darkelves_wins;
            stats.council.darkelves_losses += enemyStats.council.darkelves_losses;
            stats.council.dwarves_wins += enemyStats.council.dwarves_wins;
            stats.council.dwarves_losses += enemyStats.council.dwarves_losses;
            stats.council.tribe_wins += enemyStats.council.tribe_wins;
            stats.council.tribe_losses += enemyStats.council.tribe_losses;

            stats.darkelves.wins += enemyStats.darkelves.wins;
            stats.darkelves.losses += enemyStats.darkelves.losses;
            stats.darkelves.council_wins += enemyStats.darkelves.council_wins;
            stats.darkelves.council_losses += enemyStats.darkelves.council_losses;
            stats.darkelves.darkelves_wins += enemyStats.darkelves.darkelves_wins;
            stats.darkelves.darkelves_losses += enemyStats.darkelves.darkelves_losses;
            stats.darkelves.dwarves_wins += enemyStats.darkelves.dwarves_wins;
            stats.darkelves.dwarves_losses += enemyStats.darkelves.dwarves_losses;
            stats.darkelves.tribe_wins += enemyStats.darkelves.tribe_wins;
            stats.darkelves.tribe_losses += enemyStats.darkelves.tribe_losses;

            stats.dwarves.wins += enemyStats.dwarves.wins;
            stats.dwarves.losses += enemyStats.dwarves.losses;
            stats.dwarves.council_wins += enemyStats.dwarves.council_wins;
            stats.dwarves.council_losses += enemyStats.dwarves.council_losses;
            stats.dwarves.darkelves_wins += enemyStats.dwarves.darkelves_wins;
            stats.dwarves.darkelves_losses += enemyStats.dwarves.darkelves_losses;
            stats.dwarves.dwarves_wins += enemyStats.dwarves.dwarves_wins;
            stats.dwarves.dwarves_losses += enemyStats.dwarves.dwarves_losses;
            stats.dwarves.tribe_wins += enemyStats.dwarves.tribe_wins;
            stats.dwarves.tribe_losses += enemyStats.dwarves.tribe_losses;

            stats.tribe.wins += enemyStats.tribe.wins;
            stats.tribe.losses += enemyStats.tribe.losses;
            stats.tribe.council_wins += enemyStats.tribe.council_wins;
            stats.tribe.council_losses += enemyStats.tribe.council_losses;
            stats.tribe.darkelves_wins += enemyStats.tribe.darkelves_wins;
            stats.tribe.darkelves_losses += enemyStats.tribe.darkelves_losses;
            stats.tribe.dwarves_wins += enemyStats.tribe.dwarves_wins;
            stats.tribe.dwarves_losses += enemyStats.tribe.dwarves_losses;
            stats.tribe.tribe_wins += enemyStats.tribe.tribe_wins;
            stats.tribe.tribe_losses += enemyStats.tribe.tribe_losses;

        },this);

        stats.ratio = stats.wins.total / (stats.wins.total + stats.losses.total) * 100 || 0;

        stats.council.ratio = stats.council.wins / (stats.council.wins + stats.council.losses) * 100 || 0;
        stats.council.council_ratio = stats.council.council_wins / (stats.council.council_wins + stats.council.council_losses) * 100 || 0;
        stats.council.darkelves_ratio = stats.council.darkelves_wins / (stats.council.darkelves_wins + stats.council.darkelves_losses) * 100 || 0;
        stats.council.dwarves_ratio = stats.council.dwarves_wins / (stats.council.dwarves_wins + stats.council.dwarves_losses) * 100 || 0;
        stats.council.tribe_ratio = stats.council.tribe_wins / (stats.council.tribe_wins + stats.council.tribe_losses) * 100 || 0;

        stats.darkelves.ratio = stats.darkelves.wins / (stats.darkelves.wins + stats.darkelves.losses) * 100 || 0;
        stats.darkelves.council_ratio = stats.darkelves.council_wins / (stats.darkelves.council_wins + stats.darkelves.council_losses) * 100 || 0;
        stats.darkelves.darkelves_ratio = stats.darkelves.darkelves_wins / (stats.darkelves.darkelves_wins + stats.darkelves.darkelves_losses) * 100 || 0;
        stats.darkelves.dwarves_ratio = stats.darkelves.dwarves_wins / (stats.darkelves.dwarves_wins + stats.darkelves.dwarves_losses) * 100 || 0;
        stats.darkelves.tribe_ratio = stats.darkelves.tribe_wins / (stats.darkelves.tribe_wins + stats.darkelves.tribe_losses) * 100 || 0;

        stats.dwarves.ratio = stats.dwarves.wins / (stats.dwarves.wins + stats.dwarves.losses) * 100 || 0;
        stats.dwarves.council_ratio = stats.dwarves.council_wins / (stats.dwarves.council_wins + stats.dwarves.council_losses) * 100 || 0;
        stats.dwarves.darkelves_ratio = stats.dwarves.darkelves_wins / (stats.dwarves.darkelves_wins + stats.dwarves.darkelves_losses) * 100 || 0;
        stats.dwarves.dwarves_ratio = stats.dwarves.dwarves_wins / (stats.dwarves.dwarves_wins + stats.dwarves.dwarves_losses) * 100 || 0;
        stats.dwarves.tribe_ratio = stats.dwarves.tribe_wins / (stats.dwarves.tribe_wins + stats.dwarves.tribe_losses) * 100 || 0;

        stats.tribe.ratio = stats.tribe.wins / (stats.tribe.wins + stats.tribe.losses) * 100 || 0;
        stats.tribe.council_ratio = stats.tribe.council_wins / (stats.tribe.council_wins + stats.tribe.council_losses) * 100 || 0;
        stats.tribe.darkelves_ratio = stats.tribe.darkelves_wins / (stats.tribe.darkelves_wins + stats.tribe.darkelves_losses) * 100 || 0;
        stats.tribe.dwarves_ratio = stats.tribe.dwarves_wins / (stats.tribe.dwarves_wins + stats.tribe.dwarves_losses) * 100 || 0;
        stats.tribe.tribe_ratio = stats.tribe.tribe_wins / (stats.tribe.tribe_wins + stats.tribe.tribe_losses) * 100 || 0;


        return stats;

    }




});

var Player = Backbone.Model.extend({

    urlRoot: "/api/players",

    initialize: function(){

        _.bindAll(this);

    },


    loadEnemies: function(){
        this.enemies = new app.Enemies(this.get('enemies'));

        this.enemies.player = this;
    },

    selectGame: function(enemyId, gameId){

        //this.enemies.get(enemyId).selectGame(gameId);

    }




});

var Login = Backbone.Model.extend({

    initialize: function(){

        _.bindAll(this);

    },

    validate: function(attrs){

        if(attrs.username != undefined){
            if(attrs.username == "") return "Username is Required";

            if(attrs.username.length < 3) return "Username must have at least 3 characters";

            if(attrs.username.match(/[\<\>!@#\$%^&\*, ]+/i)) return "Username cannot have white spaces or < > ! @ # $ % ^ & *";
        }

        if(attrs.email != undefined){
            if(attrs.email == "") return "E-mail is Required";

            if(!attrs.email.match(/\S+@\S+\.\S+/)) return "Not a valid e-mail address";

        }

        if(attrs.password != undefined){
            if(attrs.password == "") return "Password is Required";

            if(attrs.password.length < 4) return "Password must have at least 4 characters";
        }

        if(attrs.rpassword != undefined){
            if(attrs.rpassword == "") return "Passwords don't match!";
            if(this.get("password") != attrs.rpassword) return "Passwords don't match!";
        }


    },

    login_facebook: function(userID, accessToken, expiresIn, startup, cb){

        var that = this;

        $.ajax({
            data: "userID=" + userID + "&accessToken=" + accessToken + "&expiresIn=" + expiresIn + (startup?"&startup=true":""),
            url: "/api/user/login-facebook"
        }).success(function( msg ) {

            that.set(msg);
            cb(undefined,msg);

        }).fail(function(err){
                cb(err.responseText);
            });

    },


    login: function(username, password, keepLogged, cb){

        var that = this;

        //first get the nonce from the server
        $.ajax({
            url: "/api/nonce"
        }).success(function( nonce ) {

                username = username.toLowerCase();

                //generate the password hash combining the actual password hash plus the random
                //number the server sends to the client (nonce) . The client password or hash is never sent
                //on the wire on the login
                var secure_password = md5.hex_md5(md5.hex_md5(username + $.trim($("#salt").html()) + password) + nonce);

                $.ajax({
                    data: "username=" + username + "&password=" + secure_password + "&nonce=" + nonce + (keepLogged?"&keepLogged=true":""),
                    url: "/api/user/login"
                }).success(function( msg ) {

                        //set the token to be used in authenticated requests
                        app.HATrackerToken = msg.token;

                        that.set(msg);
                        cb(undefined,msg);

                    }).fail(function(err){
                        try{
                            cb(JSON.parse(err.responseText).error);
                        } catch(e){
                            cb(err.responseText);
                        }

                    });



            });
    },


    continue_login: function(cb){

        var that = this;

        $.ajax({
            url: "/api/user/continue_login"
        }).success(function( msg ) {

                that.set(msg);
                cb(undefined,msg);

            }).fail(function(err){
                cb(err.responseText);
            });
    },

    logout: function(cb){

        var that = this;

        $.ajax({
            url: "/api/user/logout",
            headers: {'X-HATracker-Token': app.HATrackerToken}
        }).always(function( msg ) {
                cb();
            });


    },

    signup: function(username, email, password, cb){

        var that = this;

        $.ajax({
            contentType: "application/json",
            data: '{"username":"' + username + '","email":"' + email + '", "password":"' +  md5.hex_md5(username + $.trim($("#salt").html()) + password) + '"}',
            type: "POST",
            url: "/api/user/signup"
        }).success(function( msg ) {
                that.set(msg);
                cb(undefined,msg);
        }).fail(function(err){
                try{
                    cb(JSON.parse(err.responseText).error);
                } catch(e){
                    cb(err.responseText);
                }
            });

    },

    change_password: function(old_password, new_password, cb){

        var that = this;

        var username = this.get('username').toLowerCase();

        //first get the nonce from the server
        $.ajax({
            url: "/api/nonce"
        }).success(function( nonce ) {

                //generate the password hash combining the actual password hash plus the random
                //number the server sends to the client (nonce) . The client password or hash is never sent
                //on the wire on the login
                var secure_old_password = md5.hex_md5(md5.hex_md5(username + $.trim($("#salt").html()) + old_password) + nonce);

                var secure_new_password = md5.hex_md5(username + $.trim($("#salt").html()) + new_password);

                $.ajax({
                    contentType: "application/json",
                    data: '{"nonce":"'+ nonce + '","old_password":"' + secure_old_password + '","new_password":"' + secure_new_password + '"}',
                    type: "PUT",
                    url: "/api/user/change_password"
                }).success(function( msg ) {
                        cb(undefined);

                    }).fail(function(err){
                        try{
                            cb(JSON.parse(err.responseText).error);
                        } catch(e){
                            cb(err.responseText);
                        }

                    });



            });


    },

    forgot_password: function(email, cb){
        $.ajax({
            contentType: "application/json",
            data: '{"email":"' + email + '"}',
            type: "POST",
            url: "/api/user/forgot_password"
        }).success(function( msg ) {
                cb();
            }).fail(function(err){
                try{
                    cb(JSON.parse(err.responseText).error);
                } catch(e){
                    cb(err.responseText);
                }
            });
    },

    reset_password: function(password, confirmation, cb){

        //first get the user
        $.ajax({
            url: "/api/user/reset_password_username?confirmation=" + confirmation
        }).success(function( msg ) {

                $.ajax({
                    contentType: "application/json",
                    data: '{"confirmation":"' + confirmation + '","password":"' +  md5.hex_md5(msg.username + $.trim($("#salt").html()) + password) + '"}',
                    type: "PUT",
                    url: "/api/user/reset_password"
                }).success(function( msg ) {
                        cb();

                    }).fail(function(err){
                        try{
                            cb(JSON.parse(err.responseText).error);
                        } catch(e){
                            cb(err.responseText);
                        }
                    });




            }).fail(function(err){
                try{
                    cb(JSON.parse(err.responseText).error);
                } catch(e){
                    cb(err.responseText);
                }
            });


    },



    delete: function(cb){

        $.ajax({
            type: "DELETE",
            url: "/api/user/delete",
            headers: {'X-HATracker-Token': app.HATrackerToken}
        }).success(function( msg ) {
                cb();
            }).fail(function(err){
                cb(err.responseText);
            });

    },

    reset: function(cb){

        $.ajax({
            type: "DELETE",
            url: "/api/user/reset",
            headers: {'X-HATracker-Token': app.HATrackerToken}
        }).success(function( msg ) {
                cb();
            }).fail(function(err){
                cb(err.responseText);
            });

    }

});


$(function(){
    app.Login = Login;
    app.Player = Player;
    app.Enemy = Enemy;
    app.Game = Game;
    app.Item = Item;

    app.Enemies = Enemies;
    app.Games = Games;
    app.Items = Items;

    app.SelectionManager = new SelectionManager();


});