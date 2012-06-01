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

    },

    subCount: function(){
        var sub = this.get("itemCount")-1;
        if(sub < 0){
            this.set("itemCount",this.get("itemCountMax"));
        }else{
            this.set("itemCount",sub);
        }

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


    select: function(){

        var that = this;

        this.playerItems.fetch({error: function(mode, err){
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


        this.bind("error", function(model, err){
            console.log("ERRO2");
        });

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

            if(attrs.username.match(/[\<\>!@#\$%^&\*, ]+/i)) return "Cannot use white spaces or < > ! @ # $ % ^ & *";
        }

        if(attrs.email != undefined){
            if(attrs.email == "") return "E-mail is Required";

            if(!attrs.email.match(/\S+@\S+\.\S+/)) return "Not a valid e-mail address"

        }

        if(attrs.password != undefined){
            if(attrs.password == "") return "Password is Required";
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
        console.log(old_password);
        console.log(new_password);
        var that = this;

        var username = this.get('username').toLowerCase();
        console.log("USERNAME: " + username);

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