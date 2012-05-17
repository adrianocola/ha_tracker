app = window.app ? window.app : {};


var opts_small = {
    lines: 7, // The number of lines to draw
    length: 0, // The length of each line
    width: 4, // The line thickness
    radius: 5, // The radius of the inner circle
    rotate: 0, // The rotation offset
    color: '#000000', // #rgb or #rrggbb
    speed: 1, // Rounds per second
    trail: 37, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner-small', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: 'auto', // Top position relative to parent in px
    left: 'auto' // Left position relative to parent in px
};

var opts_big = {
    lines: 15, // The number of lines to draw
    length: 11, // The length of each line
    width: 4, // The line thickness
    radius: 20, // The radius of the inner circle
    rotate: 0, // The rotation offset
    color: '#000', // #rgb or #rrggbb
    speed: 1, // Rounds per second
    trail: 60, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner-big', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: 'auto', // Top position relative to parent in px
    left: 'auto' // Left position relative to parent in px
};

var LoggedPlayerView = Backbone.View.extend({

    el: '#logged-player',

    initialize: function(){

        _.bindAll(this);

        this.template = _.template($('#logged-player-template').html());

    },

    events: {

        'click .logout': 'logout',
        'click a.settings': 'showSettings'

    },

    showSettings: function(){
        this.$el.toggleClass('with_settings');
    },

    logout: function(){

        var that = this;

        this.model.logout(function(err){
            if(err){
                console.log("ERROR LOGOUT");
            }else{
                console.log("LOGOUT OK");
                $("#player").html("");
                app.SelectedGameView.clean();

                that.dismiss();
                app.LoginView.show();
            }
        });

    },

    logged: function(model){

        this.model = model;

        var player = new app.Player(model.toJSON());

        player.loadEnemies();

        new app.PlayerView({model: player}).render();

        this.show();

    },

    dismiss: function(){
        this.$el.addClass('dismissed');
        this.$el.removeClass('with_settings');
    },

    show: function(){
        this.$el.removeClass('dismissed');
        this.render();
    },

    render: function(){

        $(this.el).html(this.template({data: this.model.toJSON()}));

    }


});

var LoginView = Backbone.View.extend({

    el: '#login',

    initialize: function(){

        _.bindAll(this);

        this.template = _.template($('#login-template').html());
        this.clickedFacebook = false;

        this.spinner = new Spinner(opts_small);

    },

    events: {

        'click #login-create': 'renderSignup',
        'click #signup-cancel': 'renderLogin',
        'click #signup-ok': 'signup',
        'click #login-ok': 'login',
        'click .fb-login-button': 'setClickedFacebook'
    },

    setClickedFacebook: function(){
        this.clickedFacebook = true;

        FB.getLoginStatus(function(response){
            if(response.status=="connected"){
                app.LoginView.login_facebook(response.authResponse.userID,response.authResponse.accessToken,response.authResponse.expiresIn,false);
            }

        });

    },

    clickedFacebookStatus: function(){
        return this.clickedFacebook;
    },

    login_facebook: function(userID, accessToken, expiresIn, startup){

        this.$("#login-ok").html(this.spinner.spin().el);

        var that = this;


        this.model.login_facebook(userID,accessToken,expiresIn,startup, function(err,player){


            that.spinner.stop();
            that.$("#login-ok").html("Login");
            if(err){
                console.log(err);
            }else{
                that.dismiss();
                app.LoggedPlayerView.logged(that.model);
            }

        });

    },

    login: function(){

        var username = this.$('#login-username').val();
        var password = this.$('#login-password').val();

        this.$("#login-ok").html(this.spinner.spin().el);

        var that = this;


        this.model.login(username,password, this.$('#keep-logged').attr('checked'), function(err,player){


            that.spinner.stop();
            that.$("#login-ok").html("Login");
            if(err){
                that.$('.login-error').html(err);
            }else{
                //that.$('.login-msg').html("OK!");

                that.dismiss();
                app.LoggedPlayerView.logged(that.model);
            }

        });


    },


    signup: function(){

        this.$('div.signup-error').html("");
        this.$('div.signup-msg').html("");

        this.$("#username-error-icon").addClass("hidden");
        this.$("#email-error-icon").addClass("hidden");
        this.$("#password-error-icon").addClass("hidden");
        this.$("#repeat-password-error-icon").addClass("hidden");

        this.$('#signup-username').removeClass("required");
        this.$('#signup-email').removeClass("required");
        this.$('#signup-password').removeClass("required");
        this.$('#signup-repeat-password').removeClass("required");

        var username = this.$('#signup-username').val();
        var email = this.$('#signup-email').val();
        var password = this.$('#signup-password').val();
        var rpassword = this.$('#signup-repeat-password').val();

        var withError = false;
        var that = this;


        this.model.set({username: username}, {error: function(model,error){
            that.$("#username-error-icon").removeClass("hidden");
            that.$("#username-error").html(error);
            that.$('#signup-username').addClass("required");
            withError = true;
        }});

        this.model.set({email: email}, {error: function(model,error){
            that.$("#email-error-icon").removeClass("hidden");
            that.$("#email-error").html(error);
            that.$('#signup-email').addClass("required");
            withError = true;
        }});

        this.model.set({password: password}, {error: function(model,error){
            that.$("#password-error-icon").removeClass("hidden");
            that.$("#password-error").html(error);
            that.$('#signup-password').addClass("required");
            withError = true;
        }});

        this.model.set({rpassword: rpassword}, {error: function(model,error){
            that.$("#repeat-password-error-icon").removeClass("hidden");
            that.$("#repeat-password-error").html(error);
            that.$('#signup-repeat-password').addClass("required");
            withError = true;
        }});



        if(!withError){
            this.$("#signup-ok").html(this.spinner.spin().el);

            var that = this;

            this.model.signup(username,email,password, function(err,player){
                that.spinner.stop();
                that.$("#signup-ok").html("Signup");
                if(err){
                    that.$('.signup-error').html(err);
                }else{
                    //that.$('.signup-msg').html("OK!");

                    that.dismiss();
                    app.LoggedPlayerView.logged(that.model);
                }
            });
        }




    },

    renderSignup: function(){

        this.$('.fb_button_text').html("Signup with Facebook");

        this.$('#login-login').addClass('hidden');
        this.$('#login-signup').removeClass('hidden');

        this.$el.addClass('signup-window');
        this.$el.removeClass('login-window');

    },

    renderLogin: function(){

        this.$('.fb_button_text').html("Login with Facebook");

        this.$('#login-signup').addClass('hidden');
        this.$('#login-login').removeClass('hidden');

        this.$el.addClass('login-window');
        this.$el.removeClass('signup-window');

    },

    dismiss: function(){
        this.$el.addClass('dismissed');
    },

    show: function(){
        this.$el.removeClass('dismissed');
    },

    render: function(){

        $(this.el).html(this.template({}));

        return this;
    }


});


var PlayerView = Backbone.View.extend({

    el: "#player",

    initialize: function(){

        _.bindAll(this);

        this.model.bind("change",this.render,this);

    },


    render: function(){

        this.$el.empty();

        var enemiesView = new EnemiesView({collection: this.model.enemies});

        this.$el.append(enemiesView.render().el);

        return this;

    }

});

var EnemiesView = Backbone.View.extend({

    className: 'enemies',

    initialize: function(){
        this.template = _.template($('#enemies-template').html());

        _.bindAll(this);

        //se um game foi selecionado também precisa resetar a view
        this.collection.bind('reset selected', this.render, this);

        this.collection.bind('add', this.enemyAdded, this);

    },

    events: {
        'click #add-enemy':  'addEnemy'
    },

    addEnemy: function(){

        var $enemies = this.$(".enemies")

        app.AddEnemyView.enemies = this.collection;
        $enemies.prepend(app.AddEnemyView.render().el);
        app.AddEnemyView.focus();

    },

    enemyAdded: function(enemy){

        app.AddEnemyView.remove();

        var $enemies = this.$(".enemies");

        var view = new EnemyView({ model: enemy});
        $enemies.prepend(view.render().el);
    },

    render: function() {
        var $enemies;

        $(this.el).html(this.template({}));
        $enemies = this.$(".enemies");

        _.each(this.collection.sortBy('position',this),function(enemy) {
            var view = new EnemyView({ model: enemy});
            $enemies.append(view.render().el);
        })

//        this.collection.each(function(enemy) {
//            var view = new EnemyView({ model: enemy});
//            $enemies.append(view.render().el);
//        });

        return this;
    }

});

var AddEnemyView = Backbone.View.extend({

    tagName: "li",
    className: "enemy addEnemyPanel",

    initialize: function(){

        _.bindAll(this);

        this.template = _.template($("#add-enemy-template").html());

    },

    events:{
        'click .confirm-add-enemy': 'confirmAddEnemy',
        'click .cancel-add-enemy': 'cancelAddEnemy',
        'keyup #add-enemy-name': 'nameKeyPress'
    },

    nameKeyPress: function(evt){
        if(evt.keyCode == 13){
            this.confirmAddEnemy();
        }else if(evt.keyCode == 27){
            this.cancelAddEnemy();
        }
    },

    confirmAddEnemy: function(){

        this.enemies.create({name: this.$("#add-enemy-name").val()},{at:0, wait:true});

    },

    cancelAddEnemy: function(){

        this.$el.fadeOut('fast');

    },

    focus: function(){
        $("#add-enemy-name").focus();

        return this;
    },

    render: function(){

        this.$el.hide();
        this.$el.html(this.template({}));
        this.$el.fadeIn();

        //force event delegation for the created UI elements
        this.delegateEvents();

        return this;
    }

});


var EnemyView = Backbone.View.extend({
    tagName:"li",
    className: "enemy",

    initialize: function() {
        this.template = _.template($("#enemy-template").html())

        _.bindAll(this);

        this.model.games.bind('add remove', this.render, this);

        this.model.games.bind('change:selected', this.renderSelected,this);

        this.model.games.bind('change:unselected', this.renderUnselected,this);

    },

    events: {
        'click .add-game':  'addGame',
        'click .deleteEnemy': 'deleteEnemy'
    },


    addGame: function(){

        app.AddGameView.games = this.model.games;
        this.$(".games").append(app.AddGameView.render().el);
    },

    deleteEnemy: function(){
        this.model.destroy();
        this.$el.remove();
    },

    renderSelected: function(){

        this.$el.toggleClass('selected-enemy',true);

        return this;

    },

    renderUnselected: function(){

        this.$el.toggleClass('selected-enemy',false);

        return this;

    },

    render: function(){

        var $games,
            gamesCollection = this.model.games;

        $(this.el).html(this.template(this.model.toJSON()));
        this.$el.toggleClass('selected-enemy',false);

        $games = this.$(".games");

        this.model.games.each(function(game) {
            var view = new GameView({ model: game, collection: gamesCollection });
            $games.append(view.render().el);
        },this);



        return this;
    }
});

var AddGameView = Backbone.View.extend({

    tagName: "li",
    className: 'game addGamePanel',

    initialize: function(){

        _.bindAll(this);

        this.template = _.template($("#add-game-template").html());

    },

    events:{
        'click .confirm-add-game': 'confirmAddGame',
        'click .cancel-add-game': 'cancelAddGame'
    },

    confirmAddGame: function(){
        var playerRace = this.$(".add-game-player-race option:selected").text();
        var enemyRace = this.$(".add-game-enemy-race option:selected").text();

        var gameModel = new Game({
            playerRace: playerRace,
            enemyRace: enemyRace
        });

        gameModel.bind("sync",this.createdGame,this);

        this.games.create(gameModel, {wait: true});

    },

    createdGame: function(){

        var game = this.games.last();

        this.games.select(game.id);
        app.SelectedGameView.selected(game);
    },

    cancelAddGame: function(){
        this.$el.fadeOut('fast');
    },

    render: function(){
        this.$el.hide();
        $(this.el).html(this.template({}));
        this.$el.fadeIn();

        //força a delegação de eventos
        this.delegateEvents();

        return this;

    }

});

var GameView = Backbone.View.extend({
    tagName:"li",
    className:'game',


    initialize: function() {
        this.template = _.template($("#game-template").html());

        _.bindAll(this);

        this.model.bind("change:selected", this.renderSelected,this);

        this.model.bind("change:unselected", this.renderUnselected,this);

    },

    events:{
        'click': 'selectGame',
        'click .deleteGame': 'deleteGame'
    },

    selectGame: function(){

        this.collection.select(this.model.id);
        app.SelectedGameView.selected(this.model);
    },

    deleteGame: function(){
        this.model.destroy();
    },

    renderSelected: function(){

        this.$el.addClass('selected-game',true);
        this.$el.removeClass('game',false);

        return this;

    },

    renderUnselected: function(){

        this.$el.addClass('game');
        this.$el.removeClass('selected-game',false);


        return this;

    },

    render: function(){
        $(this.el).html(this.template(this.model.toJSON()));

        return this;
    }
});


var SelectedGameView = Backbone.View.extend({

    el: "#current-game",

    initialize: function() {
        _.bindAll(this);

        this.template = _.template($("#selected-game-template").html())

        //app.SelectionManager.bind("change:selectedGame",this.selected,this);

        app.SelectionManager.bind("change:unselectedGame change:unselectedEnemy",this.clean,this);

    },


    selected: function(game){
        this.model = game;

        this.render();
    },

    clean: function(){

        this.model = undefined;
        this.render();
    },

    render: function(){

        if(this.model){

            this.$el.html(this.template(this.model.toJSON()));

            this.$el.append(new PlayerItemsView({collection: this.model.playerItems, model: this.model}).render().el);
            this.$el.append(new EnemyItemsView({collection: this.model.enemyItems, model: this.model}).render().el);

        }else{
            this.$el.html(this.template({}));
        }

        return this;
    }

});


var PlayerItemsView = Backbone.View.extend({

    className: "player-items",

    initialize: function(){

        this.template = _.template($("#player-items-template").html())

        _.bindAll(this);

        this.spinner = new Spinner(opts_big);

        this.collection.bind("reset",this.renderItems,this);
        this.collection.bind("sync",this.renderRemaining,this);
    },

    renderItems: function(){

        $(this.el).fadeTo(0,1);

        this.spinner.stop();

        var $items = this.$('.items');

        this.collection.each(function(item){

            $items.append(new ItemView({model: item}).render().el);
        });


        this.renderRemaining();

        $items.hide();
        $items.fadeIn(700);

        return this;

    },


    renderRemaining: function(){

        this.$("h3").html("Remaining: " + this.collection.remaining());

        return this;

    },

    render: function(){

        $(this.el).html(this.template(this.model.toJSON()));

        $(this.el).fadeTo(0,0.3);

        this.$('.items').append(this.spinner.spin().el);

        return this;

    }


});

var EnemyItemsView = Backbone.View.extend({

    className: "enemy-items",

    initialize: function(){

        this.template = _.template($("#enemy-items-template").html())

        _.bindAll(this);

        this.spinner = new Spinner(opts_big);

        this.collection.bind("reset",this.renderItems,this);
        this.collection.bind("change:itemCount",this.renderRemaining,this);

    },

    renderItems: function(){

        $(this.el).fadeTo(0,1);

        this.spinner.stop();

        var $items = this.$('.items');

        this.collection.each(function(item){

            $items.append(new ItemView({model: item}).render().el);
        });

        this.renderRemaining();

        $items.hide();
        $items.fadeIn(700);

        return this;

    },

    renderRemaining: function(){

        this.$("h3").html("Remaining: " + this.collection.remaining());

        return this;

    },

    render: function(){

        $(this.el).html(this.template(this.model.toJSON()));

        $(this.el).fadeTo(0,0.3);

        this.$('.items').append(this.spinner.spin().el);

        return this;

    }

});


var ItemView = Backbone.View.extend({

    tagName: "li",
    className: "item",

    initialize: function(){

        _.bindAll(this);

        this.spinner = new Spinner(opts_small);

        this.template = _.template($("#item-template").html())

        this.model.bind("sync", this.renderSync, this);
    },

    events: {
        'click .itemSub': 'sub',
        'click .itemAdd': 'add',
        'click .itemImg': 'imgClick'
    },

    sub: function(){
        this.model.subCount();
        this.$(".itemCount").html(this.model.get("itemCount"));
    },

    add: function(){
        this.model.addCount();
        this.$(".itemCount").html(this.model.get("itemCount"));
    },

    imgClick: function(){

        this.sub();

        this.$(".itemImg").fadeTo(0,0.3);

        this.$(".itemCount").addClass('zero');
        //start spinner
        this.$(".itemCount").html(this.spinner.spin().el);

    },

    renderSync: function(){
        this.$(".itemImg").fadeTo(0,1);
        this.$(".itemCount").removeClass('zero');
        //stop spinner
        this.spinner.stop();
        this.$(".itemCount").html(this.model.get("itemCount"));
        this.renderItemCount();
    },

    renderItemCount: function(){

        if(!this.model.canAdd()){
            this.$(".itemAdd").attr('disabled', 'disabled');
        }else{
            this.$(".itemAdd").removeAttr('disabled');
        }
        if(!this.model.canSub()){
            this.$(".itemSub").attr('disabled', 'disabled');
        }else{
            this.$(".itemSub").removeAttr('disabled');
        }

        if(this.model.get("itemCount") == 0){
            this.$(".itemCount").addClass('zero');
            this.$(".itemImg").fadeTo(0,0.5);
        }else{
            this.$(".itemCount").removeClass('zero');
            this.$(".itemImg").fadeTo(0,1);
        }

        return this;

    },

    render: function(){

        $(this.el).html(this.template(this.model.toJSON()));

        this.renderItemCount();


        return this;
    }

});


$(function(){
    app.PlayerView = PlayerView;
    app.EnemiesView = EnemiesView;
    app.EnemyView = EnemyView;
    app.SelectedGameView = new SelectedGameView();
    app.AddGameView = new AddGameView();
    app.AddEnemyView = new AddEnemyView();
    app.LoginView = new LoginView({model: new app.Login()});
    app.LoggedPlayerView = new LoggedPlayerView();


});

