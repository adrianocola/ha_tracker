app = window.app ? window.app : {};


var opts_mini = {
    lines: 6, // The number of lines to draw
    length: 0, // The length of each line
    width: 3, // The line thickness
    radius: 4, // The radius of the inner circle
    rotate: 0, // The rotation offset
    color: '#000000', // #rgb or #rrggbb
    speed: 1, // Rounds per second
    trail: 37, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner-mini', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: 'auto', // Top position relative to parent in px
    left: 'auto' // Left position relative to parent in px
};


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

var opts_medium = {
    lines: 10, // The number of lines to draw
    length: 6, // The length of each line
    width: 4, // The line thickness
    radius: 10, // The radius of the inner circle
    rotate: 0, // The rotation offset
    color: '#000', // #rgb or #rrggbb
    speed: 1, // Rounds per second
    trail: 50, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner-medium', // The CSS class to assign to the spinner
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


var simpleErrorHandler = function(model, err){
    if(err.responseText){
        app.ErrorView.show(err.responseText);
    }else{
        app.ErrorView.show(err);
    }

};


var ErrorView = Backbone.View.extend({

    el: '#error',

    initialize: function(){

        _.bindAll(this);

        this.template = _.template($('#error-template').html());

    },

    events: {
        'click a': 'dismiss'
    },

    dismiss: function(){

        window.location = "/";
    },

    show: function(msg){

        var that = this;

        $(this.el).html(this.template(JSON.parse(msg)));

        $('#error-blanket').fadeIn(400);
        this.$el.fadeIn(400,function(){
            $('#error-blanket').removeClass("hidden");
            that.$el.removeClass("hidden");
        });

    },

    render: function(){

        $(this.el).html(this.template({error: this.options.error}));

        this.$el.removeClass("hidden");
        $('#error-blanket').removeClass("hidden");

        return this;
    }

});


var ForgotPasswordView = Backbone.View.extend({

    el: '#forgot-password-panel',

    initialize: function(){

        _.bindAll(this);

        this.template = _.template($('#forgot-password-template').html());

        this.spinner = new Spinner(opts_small);

        this.canSend = true;

        var that = this;

        $("#error-blanket").click(function(){
            that.dismiss();
        });

    },

    events: {
        'click #forgot-cancel': 'dismiss',
        'click #forgot-ok': 'dismiss',
        'click #forgot-send': 'confirmSendMail',
        'keyup #forgot-password-email': 'keyPress'
    },

    keyPress: function(evt){
        if(evt.keyCode == 13){
            this.confirmSendMail();
        }else{
            this.$('.forgot-error').addClass('hidden');
        }
    },

    confirmSendMail: function(){

        if(!this.canSend){
            return;
        }

        if(!this.$('#forgot-password-email').val()){
            this.$('.forgot-error').html('E-mail is Required');
            this.$('.forgot-error').removeClass('hidden');
            return;
        }

        if(!this.$('#forgot-password-email').val().match(/\S+@\S+\.\S+/)){
            this.$('.forgot-error').html('Not a valid e-mail address');
            this.$('.forgot-error').removeClass('hidden');
            return;
        }

        this.$('#forgot-send').html(this.spinner.spin().el);

        this.canSend = false;

        new app.Login().forgot_password(this.$('#forgot-password-email').val(),function(err){
            if(err){
                this.$('.forgot-error').html(err);
                this.$('.forgot-error').removeClass('hidden');

                this.$('#forgot-send').html("Send e-mail");
                this.canSend = true;
            }else{
                this.$('.forgot-msg').html('E-mail sent with success!');
                this.$('.forgot-msg').removeClass('hidden');

                this.$('#forgot-password-email').attr('disabled', 'disabled');
                this.$('#forgot-ok').removeClass('hidden');
                this.$('#forgot-ok').focus();
                this.$('#forgot-send').addClass('hidden');
                this.$('#forgot-cancel').addClass('hidden');

            }
        });

    },

    dismiss: function(){

        var that = this;

        $('#error-blanket').fadeOut(400);
        this.$el.fadeOut(400,function(){
            $('#error-blanket').addClass("hidden");
            that.$el.addClass("hidden");
        });

        //remove the keyup event created in show
        $(document).unbind('keyup');
    },

    render: function(){

        var that = this;

        $(this.el).html(this.template());

        $('#error-blanket').fadeIn(400);
        this.$el.fadeIn(400,function(){
            $('#error-blanket').removeClass("hidden");
            that.$el.removeClass("hidden");
        });

        //if the user press ESC, dismiss the signup popup
        $(document).bind('keyup', function(e){
            if(e.keyCode==27){
                that.dismiss();
            }
        });

        this.$('#forgot-password-email').focus();

        return this;
    }

});

var LoggedPlayerView = Backbone.View.extend({

    el: '#logged-player',

    initialize: function(){

        _.bindAll(this);

        this.template = _.template($('#logged-player-template').html());

        this.spinner = new Spinner(opts_small);

        var that = this;

        //fetch the player
        var player = new app.Player({id: this.model.get('player')});

        player.fetch({success: function(){
            that.show();

            player.loadEnemies();
            new app.PlayerView({model: player}).render();

        }});



    },

    events: {

        'click .logout': 'logout',
        'click a.settings': 'showSettings',
        'click .delete-account': 'deleteAcctount',
        'click .delete-yes': 'confirmDelete',
        'click .delete-no': 'denyDelete',
        'click .reset-account': 'resetAcctount',
        'click .reset-yes': 'confirmReset',
        'click .reset-no': 'denyReset'

    },

    deleteAcctount: function(){
        this.denyReset();
        this.$('.confirm-delete').slideDown();

    },

    confirmDelete: function(){
        var that = this;

        this.model.delete(function(err){

            if(err){
                simpleErrorHandler(undefined,err);
            }else{
                window.location = '/';
            }

        });
    },

    denyDelete: function(){
        this.$('.confirm-delete').slideUp();
    },

    resetAcctount: function(){
        this.denyDelete();
        this.$('.confirm-reset').slideDown();

    },

    confirmReset: function(){
        var that = this;

        this.model.reset(function(err){

            if(err){
                simpleErrorHandler(undefined,err);
            }else{
                window.location = '/';
            }

        });
    },

    denyReset: function(){
        this.$('.confirm-reset').slideUp();
    },

    showSettings: function(){

        //if its a facebook account don't offer to change password
        if(this.model.toJSON().facebook){
            this.$('.change-password').hide();
        }


        this.$el.toggleClass('with_settings');
        this.$('.confirm-delete').hide();
        this.$('.confirm-reset').hide();
    },

    logout: function(){

        var that = this;

        this.model.logout(function(err){
            window.location = "/";

        });

    },

    logged: function(model){

        this.model = model;

        var player = new app.Player({id: model.get('_id')});

        player.fetch({success: function(){
            player.loadEnemies();
            new app.PlayerView({model: player}).render();
        }});

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

        var that = this;
        var json = this.model.toJSON();

        if(json.facebook){
            this.$el.html(this.spinner.spin().el);


            //need to use getJSON to avoid SOP errors
            $.getJSON("https://graph.facebook.com/" + json.facebook.userID + "?access_token=" + json.facebook.accessToken + "&callback=?", function( fbUser ) {

                json.username = fbUser.name;
                json.avatar = "http://graph.facebook.com/" + fbUser.id + "/picture";

                $(that.el).html(that.template({data: json}));

            });
        }else{
            $(this.el).html(this.template({data: json}));
        }

        return this;

    }


});

var SignupView = Backbone.View.extend({

    el: '#signup',

    initialize: function(){

        _.bindAll(this);

        this.template = _.template($('#signup-template').html());

        this.spinner = new Spinner(opts_small);

        var that = this;

        $("#signup-blanket").click(function(){
            that.dismiss();
        });

    },

    events: {
        'click #signup-blanket': 'dismiss',
        'click #signup-ok': 'signup',
        'click #signup-cancel': 'dismiss',
        'keyup body': 'keyPress',
        'click .fb_button': 'clickedFacebook'
    },

    keyPress: function(evt){
        if(evt.keyCode == 27){
            this.dismiss();
        }
    },

    clickedFacebook: function(){

        var that = this;



        FB.login(function(response){

            if(response.status=="connected"){

                FB.getLoginStatus(function(response){

                        //app.LoginView.login_facebook(response.authResponse.userID,response.authResponse.accessToken,response.authResponse.expiresIn,false);
                        if(response.status=="connected"){
                            that.model.login_facebook(response.authResponse.userID,response.authResponse.accessToken,response.authResponse.expiresIn,false, function(err,player){

                                if(err){
                                    console.log(err);
                                }

                                that.logged(err);

                            });
                        }


                },true);

            }




        }, { auth_type: 'reauthenticate' ,scope: 'user_about_me'});
        //{ auth_type: 'reauthenticate' ,scope: 'user_about_me'}

//        FB.getLoginStatus(function(response){
//            if(response.status=="connected"){
//                app.LoginView.login_facebook(response.authResponse.userID,response.authResponse.accessToken,response.authResponse.expiresIn,false);
//            }
//
//        });

    },

    logged: function(){
        this.dismiss();
        app.LoginView.dismiss();

        app.CurrentPlayerView = new app.LoggedPlayerView({model: this.model });
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
                    that.logged();
                }
            });
        }


    },

    initial_dismiss: function(){

        $('#signup-blanket').addClass("hidden");
        this.$el.addClass("hidden");
    },


    dismiss: function(){

        var that = this;

        $('#signup-blanket').fadeOut(400);
        this.$el.fadeOut(400,function(){
            $('#signup-blanket').addClass("hidden");
            that.$el.addClass("hidden");
        });

        //remove the keyup event created in show
        $(document).unbind('keyup');
    },

    show: function(){
        this.$('#signup-username').val("");
        this.$('#signup-email').val("");
        this.$('#signup-password').val("");
        this.$('#signup-repeat-password').val("");

        var that = this;

        $('#signup-blanket').fadeIn(400);
        this.$el.fadeIn(400,function(){
            $('#signup-blanket').removeClass("hidden");
            that.$el.removeClass("hidden");
        });

        //if the user press ESC, dismiss the signup popup
        $(document).bind('keyup', function(e){
            if(e.keyCode==27){
                that.dismiss();
            }
        });

        this.$('#signup-username').focus();
    },

    render: function(){

        $(this.el).html(this.template({}));

        this.$el.removeClass("hidden");
        $('#signup-blanket').removeClass("hidden");

        return this;
    }


});

var LoginView = Backbone.View.extend({

    el: '#login',


    initialize: function(){

        _.bindAll(this);

        this.template = _.template($('#login-template').html());

        this.spinner = new Spinner(opts_small);

        this.visible = false;

    },

    events: {

        'click #login-create': 'renderSignup',
        'click #login-ok': 'login',
        'click .fb_button': 'clickedFacebook',
        'click #forgot-password': 'forgot_password',
        'keyup #login-password': 'pressedEnter'
    },

    forgot_password: function(){
        console.log("FORGOT");
        new ForgotPasswordView().render();
    },


    pressedEnter: function(evt){
        if(evt.keyCode == 13){
            this.login();
        }

    },

    clickedFacebook: function(){

        var that = this;

        //user clicked on facebook button. Must authenticate the user with
        //facebook before login
        FB.login(function(response){

                if(response.status=="connected"){

                    FB.getLoginStatus(function(response){

                        if(response.status=="connected"){

                            that.login_facebook(response.authResponse.userID,response.authResponse.accessToken,response.authResponse.expiresIn,false);
                        }

                    },true);

                }

        },{auth_type: 'reauthenticate', scope: 'user_about_me'});

    },

    logged: function(err){
        this.spinner.stop();
        this.$("#login-ok").html("Login");

        if(!err){
            this.dismiss();

            app.CurrentPlayerView = new app.LoggedPlayerView({model: this.model });
        }

    },

    login_facebook: function(userID, accessToken, expiresIn, startup){

        this.$("#login-ok").html(this.spinner.spin().el);

        var that = this;

        this.model.login_facebook(userID,accessToken,expiresIn,startup, function(err,player){

            if(err){
                simpleErrorHandler(undefined,err);
            }else{
                that.logged(err);
            }



        });

    },

    login: function(){

        var username = this.$('#login-username').val();
        var password = this.$('#login-password').val();

        this.$("#login-ok").html(this.spinner.spin().el);

        var that = this;

        this.model.login(username,password, this.$('#keep-logged').attr('checked'), function(err,player){

            if(err){
                that.$('.login-error').html(err);
            }

            that.logged(err);

        });


    },

    renderSignup: function(){

//        this.$('.fb_button_text').html("Signup with Facebook");
//
//        this.$('#login-login').addClass('hidden');
//        this.$('#login-signup').removeClass('hidden');
//
//        this.$el.addClass('signup-window');
//        this.$el.removeClass('login-window');

        app.SignupView.show();

    },

    initial_dismiss: function(){
        this.visible = false;
        this.$el.addClass("hidden");
    },

    dismiss: function(){
        this.visible = false;
        this.$el.fadeTo(300,0);
    },

    show: function(){
        //this.$('#login-username').val("");
        //this.$('#login-password').val("");
        this.visible = true;
        this.render();
        this.$el.fadeTo(300,1);
    },

    render_loading: function(){
        $(this.el).html(new Spinner(opts_medium).spin().el);
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
        'click #add-enemy':  'addEnemy',
        'keyup #filter': 'filter'
    },

    filter: function(){

        this.collection.filter($('#filter').val().toLowerCase());

        $enemies = this.$(".enemies");

        $enemies.html('');

        _.each(this.collection.sortBy('position',this),function(enemy) {
            if(enemy.visible){
                var view = new EnemyView({collection: this.collection, model: enemy});
                $enemies.append(view.render().el);
            }

        },this);

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
            if(enemy.visible){
                console.log(this);
                var view = new EnemyView({collection: this.collection, model: enemy});
                $enemies.append(view.render().el);
            }

        },this)

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

        this.spinner = new Spinner(opts_small);

    },

    events:{
        'click .confirm-add-enemy': 'confirmAddEnemy',
        'click .cancel-add-enemy': 'cancelAddEnemy',
        'keyup #add-enemy-name': 'nameKeyPress'
    },

    nameKeyPress: function(evt){

        //ENTER
        if(evt.keyCode == 13){
            if(this.$('#add-enemy-name').val().length != 0 && !this.enemies.exists(this.$('#add-enemy-name').val())){
                this.confirmAddEnemy();
            }
        //ESC
        }else if(evt.keyCode == 27){
            this.cancelAddEnemy();
        }else{
            if(this.$('#add-enemy-name').val().length == 0){
                this.$('.confirm-add-enemy').attr('disabled', 'disabled');
            }else{
                if(this.enemies.exists(this.$('#add-enemy-name').val())){
                    this.$('.confirm-add-enemy').attr('disabled', 'disabled');
                    this.$('.enemyExists').removeClass('hidden');
                }else{
                    this.$('.confirm-add-enemy').removeAttr('disabled');
                    this.$('.enemyExists').addClass('hidden');

                }
            }

        }
    },

    confirmAddEnemy: function(){

        this.$(".confirm-add-enemy").html(this.spinner.spin().el);

        this.enemies.create({name: this.$("#add-enemy-name").val()},{at:0, wait:true, error: simpleErrorHandler});

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

        this.$('.confirm-add-enemy').attr('disabled', 'disabled');

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

        this.spinner = new Spinner(opts_small);

    },

    events: {
        'click .add-game':  'addGame',
        'click .deleteEnemy': 'deleteEnemy',
        'dblclick .enemyName': 'renameEnemy',
        'keyup .newEnemyName': 'confirmRenameEnemy'
    },


    addGame: function(){

        app.AddGameView.games = this.model.games;
        this.$(".games").append(app.AddGameView.render().el);
    },

    deleteEnemy: function(){
        this.model.destroy({error: simpleErrorHandler});
        this.$el.remove();
    },

    renameEnemy: function(){

        this.$('.newEnemyName').val(this.$('.enemyName').html());

        this.$('.enemyName').addClass('hidden');
        this.$('.newEnemyName').removeClass('hidden');

        this.$('.newEnemyName').focus();
    },

    cancelRenameEnemy: function(){

        this.$('.newEnemyName').addClass('hidden');
        this.$('.enemyName').removeClass('hidden');

        this.$('.enemyExists').addClass('hidden');

    },


    confirmRenameEnemy: function(evt){

        var that = this;

        //ENTER
        if(evt.keyCode == 13){
            if(this.$('.newEnemyName').val().length != 0 && !this.collection.exists(this.$('.newEnemyName').val())){

                this.$('.newEnemyName').addClass('hidden');
                this.$('.enemyName').removeClass('hidden');

                this.$('.enemyName').html(this.spinner.spin().el);

                this.model.save({name: this.$('.newEnemyName').val()},{success: function(){

                    this.$('.enemyExists').addClass('hidden');

                    that.$('.enemyName').html(that.model.get('name'));
                }, error: simpleErrorHandler});


            }
            //ESC
        }else if(evt.keyCode == 27){
            this.cancelRenameEnemy();
        }else{
            if(this.$('.newEnemyName').val().length != 0 && this.collection.exists(this.$('.newEnemyName').val())){
                this.$('.enemyExists').removeClass('hidden');
            }else{
                this.$('.enemyExists').addClass('hidden');

            }
        }

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

        this.spinner = new Spinner(opts_mini);

    },

    events:{
        'click .confirm-add-game': 'confirmAddGame',
        'click .cancel-add-game': 'cancelAddGame'
    },

    confirmAddGame: function(){
        console.log("COISA");

        var playerRace = this.$(".add-game-player-race option:selected").text();
        var enemyRace = this.$(".add-game-enemy-race option:selected").text();

        var gameModel = new Game({
            playerRace: playerRace,
            enemyRace: enemyRace
        });

        gameModel.bind("sync",this.createdGame,this);

        this.$(".confirm-add-game").html(this.spinner.spin().el);

        this.games.create(gameModel, {wait: true, error: simpleErrorHandler});

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

        this.model.bind("error", this.error,this);

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
        this.model.destroy({error: simpleErrorHandler});
    },

    error: function(msg){
        simpleErrorHandler(undefined, msg);
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

            var $items_panel = this.$('.items-panel');

            $items_panel.append(new PlayerItemsView({collection: this.model.playerItems, model: this.model}).render().el);
            $items_panel.append(new EnemyItemsView({collection: this.model.enemyItems, model: this.model}).render().el);

        }else{
            this.$el.html(this.template({}));

            //this.$('.game-info').html('');
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

        this.canEdit = true;
    },

    events: {
        'click .itemSub': 'sub',
        'click .itemAdd': 'add',
        'click .itemImg': 'imgClick'
    },

    sub: function(){
        this.model.subCount();

        this.model.save({},{error: simpleErrorHandler});

        this.$(".itemCount").html(this.model.get("itemCount"));
    },

    add: function(){
        this.model.addCount();

        this.model.save({},{error: simpleErrorHandler});

        this.$(".itemCount").html(this.model.get("itemCount"));
    },

    imgClick: function(){
        //only allow one update of item count
        if(!this.canEdit){
            return;
        }


        this.sub();

        this.$(".itemImg").fadeTo(0,0.3);

        this.$(".itemCount").addClass('zero');
        //start spinner
        this.$(".itemCount").html(this.spinner.spin().el);

        this.canEdit = false;

    },

    renderSync: function(){
        this.$(".itemImg").fadeTo(0,1);
        this.$(".itemCount").removeClass('zero');
        //stop spinner
        this.spinner.stop();
        this.$(".itemCount").html(this.model.get("itemCount"));
        this.renderItemCount();

        this.canEdit = true;
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
    var LoginModel = new app.Login();

    app.PlayerView = PlayerView;
    app.EnemiesView = EnemiesView;
    app.EnemyView = EnemyView;
    app.SelectedGameView = new SelectedGameView();
    app.AddGameView = new AddGameView();
    app.AddEnemyView = new AddEnemyView();
    app.SignupView = new SignupView({model: LoginModel});
    app.LoginView = new LoginView({model: LoginModel});
    app.LoggedPlayerView = LoggedPlayerView;
    app.ErrorView = new ErrorView();

});

