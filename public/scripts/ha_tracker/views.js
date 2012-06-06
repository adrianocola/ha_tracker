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
    zIndex: 10, // The z-index (defaults to 2000000000)
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
    zIndex: 10, // The z-index (defaults to 2000000000)
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
    zIndex: 10, // The z-index (defaults to 2000000000)
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
    zIndex: 10, // The z-index (defaults to 2000000000)
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
            this.canSend = true;
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

        if(!this.canSend){
            return;
        }

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

        this.can_change_password = true;

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
        'click .reset-no': 'denyReset',
        'click button.change-password': 'changePassword'

    },

    changePassword: function(){

        this.$('.reset-error').addClass('hidden');
        this.$('.reset-msg').addClass('hidden');

        if(!this.can_change_password){
            return;
        }

        if(this.$('#change-password-current').val()=="" || this.$('#change-password-new').val()==""){
            this.$('.reset-error').html("Password can't be empty");
            this.$('.reset-error').removeClass('hidden');
            return;
        }

        if(this.$('#change-password-current').val().length < 4 || this.$('#change-password-new').val().length < 4){
            this.$('.reset-error').html("Password too short (<4)");
            this.$('.reset-error').removeClass('hidden');
            return;
        }

        if(this.$('#change-password-new').val() != this.$('#change-password-repeat').val()){
            this.$('.reset-error').html("Passwords don't match ");
            this.$('.reset-error').removeClass('hidden');
            return;
        }


        var old_text = this.$('button.change-password').html();
        this.$('button.change-password').html(this.spinner.spin().el);

        var that = this;


        this.can_change_password = false;

        this.model.change_password(this.$('#change-password-current').val(),this.$('#change-password-new').val(),function(err){


            if(err){
                this.$('.reset-error').html(err);
                this.$('.reset-error').removeClass('hidden');
            }else{
                this.$('#change-password-current').val("");
                this.$('#change-password-new').val("");
                this.$('#change-password-repeat').val("");


                this.$('.reset-msg').html("Changed with success!");
                this.$('.reset-msg').removeClass('hidden');
            }

            that.spinner.stop();
            that.$('button.change-password').html(old_text);
            that.can_change_password = true;


        });

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

        //clean the selected game view
        $('.example').fadeOut();;

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

        //clean the selected game view
        $('.example').fadeOut();

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

        var that = this;

        $('#example-signup').click(function(){
            that.renderSignup();
        });

    },

    events: {

        'click #login-create': 'renderSignup',
        'click #login-ok': 'login',
        'click .fb_button': 'clickedFacebook',
        'click #forgot-password': 'forgot_password',
        'keyup #login-password': 'pressedEnter'
    },

    forgot_password: function(){
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


            //clean the selected game view
            $('.example').fadeOut();
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

        var that = this;

        var username = this.$('#login-username').val();


        var withError = false;

        //verify if its a valid username before sending to the server
        this.model.set({username: username}, {error: function(model,error){
            that.$('.login-error').html(error);

            withError = true;
        }});

        if(withError) return;

        var password = this.$('#login-password').val();

        //verify if its a valid username before sending to the server
        this.model.set({password: password}, {error: function(model,error){
            that.$('.login-error').html(error);

            withError = true;
        }});

        if(withError) return;

        this.$("#login-ok").html(this.spinner.spin().el);


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

        this.$('#login-username').focus();

        return this;
    }


});


var PlayerView = Backbone.View.extend({

    el: "#player",

    initialize: function(){

        _.bindAll(this);

        //this.model.bind("change",this.render,this);

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
        'keyup #filter': 'filter',
        'change #showActive': 'setShowOnlyActive',
        'change #showState': 'setShowState'
    },

    setShowOnlyActive: function(){

        var showOnlyActive = this.$('#showActive').attr('checked')?true:false;

        if(showOnlyActive){
            this.$('#showState').attr('disabled','disabled');
        }else{
            this.$('#showState').removeAttr('disabled');
        }

        this.collection.showOnlyActive(showOnlyActive);

        this.collection.player.save({showOnlyActive: showOnlyActive});

        this.filter();

    },

    setShowState: function(){

        var showState = this.$('#showState').attr('checked')?true:false;

        if(showState){
            $('.game.won').addClass('showState');
            $('.game.lost').addClass('showState');
        }else{
            $('.game.won.showState').removeClass('showState');
            $('.game.lost.showState').removeClass('showState');
        }

        this.collection.player.save({showState: showState});

    },

    filter: function(){

        this.collection.filter($('#filter').val().toLowerCase());

        $enemies = this.$(".enemies");

        $enemies.html('');

        _.each(this.collection.sortBy('position',this),function(enemy) {
            if(enemy.isVisible()){
                var view = new EnemyView({collection: this.collection, model: enemy});
                $enemies.append(view.render().el);
            }

        },this);

        //verify if the player have the option "Show state" marked
        if(this.collection.player.get('showState')){
            this.$('.game.won').addClass('showState');
            this.$('.game.lost').addClass('showState');
        }

        //control to hide the selectect game if it is not visible after aplying a filter or active only filter
        if(!app.SelectionManager.selectedEnemy.isVisible() || !app.SelectionManager.selectedGame.isVisible()){
            app.SelectedGameView.hide();
        }else{
            app.SelectedGameView.show();
        }


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

        var view = new EnemyView({ model: enemy, collection: this.collection});
        $enemies.prepend(view.render().el);
    },

    render: function() {
        var $enemies;

        $(this.el).html(this.template({}));
        $enemies = this.$(".enemies");

        //verify if the player have the option "Show only active" marked
        if(this.collection.player.get('showOnlyActive')){
            this.collection.showOnlyActive(true);
            this.$('#showActive').attr('checked',true);
            this.$('#showState').attr('disabled','disabled');
        }

        //render all enemies
        this.collection.each(function(enemy) {
            if(enemy.isVisible()){
                var view = new EnemyView({collection: this.collection, model: enemy});
                $enemies.append(view.render().el);
            }

        },this);

        //verify if the player have the option "Show state" marked
        if(this.collection.player.get('showState')){
            console.log("DEVERIA PINTAR");
            this.$('#showState').attr('checked',true);
            this.$('.game.won').addClass('showState');
            this.$('.game.lost').addClass('showState');
        }


        return this;
    }

});

var AddEnemyView = Backbone.View.extend({

    tagName: "li",
    className: "enemy-container addEnemyPanel",

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
    className: "enemy-container",

    initialize: function() {
        this.template = _.template($("#enemy-template").html())

        _.bindAll(this);

        this.model.games.bind('add', this.render, this);

        this.model.games.bind('change:selected', this.renderSelected,this);

        this.model.games.bind('change:unselected', this.renderUnselected,this);

        this.spinner = new Spinner(opts_small);

    },

    events: {
        'click .add-game':  'addGame',
        'click .deleteEnemy': 'deleteEnemy',
        'click .delete-enemy-yes': 'confirmDeleteEnemy',
        'click .delete-enemy-no': 'denyDeleteEnemy',
        'dblclick .enemyName': 'renameEnemy',
        'keyup .newEnemyName': 'confirmRenameEnemy'
    },


    addGame: function(){

        app.AddGameView.games = this.model.games;
        this.$(".games").prepend(app.AddGameView.render().el);
    },

    deleteEnemy: function(){
        var that = this;

        this.$('div.enemyDeleteMask').fadeIn();
        this.$('div.enemyDeleteText').slideDown();

        this.cancelTimeout = setTimeout(function(){
            that.denyDeleteEnemy();
        },10000);
    },

    confirmDeleteEnemy: function(){
        clearTimeout(this.cancelTimeout);

        var that = this;

        this.model.destroy({error: simpleErrorHandler, success: function(){
            that.$el.slideUp(function(){
                that.remove();
            });

        }});
    },

    denyDeleteEnemy: function(){
        clearTimeout(this.cancelTimeout);


        this.$('div.enemyDeleteMask').fadeOut();
        this.$('div.enemyDeleteText').slideUp();

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

                    that.$('.enemyExists').addClass('hidden');

                    that.$('.enemyName').html(that.model.get('name'));
                }, error: simpleErrorHandler});

            }else if(this.$('.newEnemyName').val() == this.$('.enemyName').html()){
                this.$('.enemyExists').addClass('hidden');

                this.$('.newEnemyName').addClass('hidden');
                this.$('.enemyName').removeClass('hidden');

            }


        //ESC
        }else if(evt.keyCode == 27){
            this.cancelRenameEnemy();
        }else{
            if(this.$('.newEnemyName').val().length != 0 && this.$('.newEnemyName').val() != this.$('.enemyName').html() && this.collection.exists(this.$('.newEnemyName').val())){
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
            if(game.isVisible()){
                var view = new GameView({ model: game, collection: gamesCollection });
                $games.append(view.render().el);
            }
        },this);



        return this;
    }
});

var AddGameView = Backbone.View.extend({

    tagName: "li",
    className: 'game-container addGamePanel',

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

        var game = this.games.first();

        this.games.select(game.id);
        app.SelectedGameView.selected(game);
    },

    cancelAddGame: function(){
        this.$el.fadeOut('fast');
        //this.$el.slideUp();
    },

    render: function(){

        this.$el.hide();
        $(this.el).html(this.template({}));
        this.$el.fadeIn();
        //this.$el.slideDown();

        //força a delegação de eventos
        this.delegateEvents();

        return this;

    }

});

var GameView = Backbone.View.extend({
    tagName:"li",
    className:'game-container',


    initialize: function() {
        this.template = _.template($("#game-template").html());

        _.bindAll(this);

        this.model.bind("change:selected", this.renderSelected,this);

        this.model.bind("change:unselected", this.renderUnselected,this);

        this.model.bind("change:state", this.renderState,this);

        this.model.bind("error", this.error,this);

        this.cancelTimeout = undefined;

    },

    events:{
        'click .gameNum': 'selectGame',
        'click .gamePanel': 'selectGame',
        'click .deleteGame': 'deleteGame',
        'click .delete-game-yes': 'confirmDeleteGame',
        'click .delete-game-no': 'denyDeleteGame'
    },

    selectGame: function(){
        this.collection.select(this.model.id);
        app.SelectedGameView.selected(this.model);
    },

    deleteGame: function(){

        var that = this;

        this.$('div.gameDeleteMask').fadeIn();
        this.$('div.gameDeleteText').slideDown();

        this.cancelTimeout = setTimeout(function(){
            that.denyDeleteGame();
        },10000);

    },

    confirmDeleteGame: function(){
        clearTimeout(this.cancelTimeout);

        var that = this;

        this.model.destroy({error: simpleErrorHandler, success: function(){
            that.$el.slideUp(function(){
                that.remove();
            });

        }});
    },

    denyDeleteGame: function(){
        clearTimeout(this.cancelTimeout);


        this.$('div.gameDeleteMask').fadeOut();
        this.$('div.gameDeleteText').slideUp();

    },

    error: function(msg){
        simpleErrorHandler(undefined, msg);
    },

    renderSelected: function(){

        this.$('.game').addClass('selected-game',true);
        //this.$el.removeClass('game',false);

        return this;

    },

    renderUnselected: function(){

        //this.$el.addClass('game');
        this.$('.game').removeClass('selected-game',false);


        return this;

    },

    renderState: function(){

        if(this.model.isWon()){
            this.$('.game').removeClass('lost');
            this.$('.game').addClass('won');
        }else if(this.model.isLost()){
            this.$('.game').removeClass('won');
            this.$('.game').addClass('lost');
        }else{
            this.$('.game').removeClass('won');
            this.$('.game').removeClass('lost');
        }


        if($('#showState').attr('checked')){
            this.$('.game').addClass('showState');
        }


        return this;

    },

    render: function(){
        this.$el.html(this.template(this.model.toJSON()));

        this.renderState();

        //verify if is rendering the selected game. If is, also
        //render the game as selected
        if(this.model == app.SelectionManager.selectedGame){
            this.renderSelected();
        }

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

    events: {
        'click #state_in_progress': 'in_progress',
        'click #state_won': 'won',
        'click #state_lost': 'lost',
        'click div.state-box.in_progress': 'in_progress',
        'click div.state-box.won': 'won',
        'click div.state-box.lost': 'lost',
        'change #state_select_won': 'select_won',
        'change #state_select_lost': 'select_lost'
    },

    in_progress: function(){
        this.$('#state_in_progress').attr('checked', 'checked');

        this.$('#state_select_won').attr('disabled', 'disabled');
        this.$('#state_select_lost').attr('disabled', 'disabled');

        this.$('.player-items-mask').addClass('hidden');
        this.$('.enemy-items-mask').addClass('hidden');
        this.$('.player-items-mask').fadeOut();
        this.$('.enemy-items-mask').fadeOut();

        this.$('div.state-box.in_progress').addClass('selected');
        this.$('div.state-box.won').removeClass('selected');
        this.$('div.state-box.lost').removeClass('selected');

        this.model.save({state: 0},{error: simpleErrorHandler});
    },

    won: function(){
        this.$('#state_won').attr('checked', 'checked');

        this.$('#state_select_won').removeAttr('disabled');
        this.$('#state_select_lost').attr('disabled', 'disabled');

        this.$('.player-items-mask').fadeIn(600);
        this.$('.enemy-items-mask').fadeIn(600);

        this.$('div.state-box.in_progress').removeClass('selected');
        this.$('div.state-box.won').addClass('selected');
        this.$('div.state-box.lost').removeClass('selected');

        this.model.save({state: consts.States_Inverse[this.$('#state_select_won').val()]},{error: simpleErrorHandler});

    },

    lost: function(){
        this.$('#state_lost').attr('checked', 'checked');

        this.$('#state_select_lost').removeAttr('disabled');
        this.$('#state_select_won').attr('disabled', 'disabled');

        this.$('.player-items-mask').fadeIn(600);
        this.$('.enemy-items-mask').fadeIn(600);

        this.$('div.state-box.in_progress').removeClass('selected');
        this.$('div.state-box.won').removeClass('selected');
        this.$('div.state-box.lost').addClass('selected');

        this.model.save({state: consts.States_Inverse[this.$('#state_select_lost').val()]},{error: simpleErrorHandler});

    },

    select_won: function(){
        this.model.save({state: consts.States_Inverse[this.$('#state_select_won').val()]},{error: simpleErrorHandler});
    },

    select_lost: function(){
        this.model.save({state: consts.States_Inverse[this.$('#state_select_lost').val()]},{error: simpleErrorHandler});
    },

    selected: function(game){
        this.model = game;

        this.render();
    },

    hide: function(){
        this.$el.hide();
    },

    show: function(){
        this.$el.show();
    },

    clean: function(){

        this.model = undefined;
        return this.render();
    },


    render: function(){

        this.show();

        if(this.model){
            var json = this.model.toJSON();

            this.$el.html(this.template({data: json}));

            this.playerItems = new PlayerItemsView({collection: this.model.playerItems, model: this.model});
            this.enemyItems = new EnemyItemsView({collection: this.model.enemyItems, model: this.model});

            //configure game state
            if(json.state == 0){
                this.$('#state_select_won').attr('disabled', 'disabled');
                this.$('#state_select_lost').attr('disabled', 'disabled');
                this.$('#state_in_progress').attr('checked', 'checked');

                this.$('.player-items-mask').addClass('hidden');
                this.$('.enemy-items-mask').addClass('hidden');

                this.$('div.state-box.in_progress').addClass('selected');
                this.$('div.state-box.won').removeClass('selected');
                this.$('div.state-box.lost').removeClass('selected');


            }else if(json.state >= 1 && json.state <= 4){
                this.$('#state_select_won').removeAttr('disabled');
                this.$('#state_select_lost').attr('disabled', 'disabled');
                this.$('#state_select_won').val(consts.States[json.state]);
                this.$('#state_won').attr('checked', 'checked');

                this.$('.player-items-mask').removeClass('hidden');
                this.$('.enemy-items-mask').removeClass('hidden');

                this.$('div.state-box.in_progress').removeClass('selected');
                this.$('div.state-box.won').addClass('selected');
                this.$('div.state-box.lost').removeClass('selected');

            }else if(json.state >= 5 && json.state <= 8){
                this.$('#state_select_lost').removeAttr('disabled');
                this.$('#state_select_won').attr('disabled', 'disabled');
                this.$('#state_select_lost').val(consts.States[json.state]);
                this.$('#state_lost').attr('checked', 'checked');

                this.$('.player-items-mask').removeClass('hidden');
                this.$('.enemy-items-mask').removeClass('hidden');

                this.$('div.state-box.in_progress').removeClass('selected');
                this.$('div.state-box.won').removeClass('selected');
                this.$('div.state-box.lost').addClass('selected');
            }

            var $items_panel = this.$('.items-panel');

            $items_panel.append(this.playerItems.render().el);
            $items_panel.append(this.enemyItems.render().el);




        }else{
            this.$el.html(this.template({data: undefined}));

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
        },this);


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
        'click .click-to-reset': 'sub',
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
            this.$el.addClass('zero');
            this.$(".itemImg").fadeTo(400,0.5);
        }else{
            this.$el.removeClass('zero');
            this.$(".itemImg").fadeTo(400,1);
        }

        return this;

    },

    render: function(){

        $(this.el).html(this.template(this.model.formatToJSON()));

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

