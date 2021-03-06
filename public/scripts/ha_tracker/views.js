app = window.app ? window.app : {};

app.f = new Array();
function factorial (n){
    if (n==0 || n==1) return 1;
    if(app.f[n]>0)
        return app.f[n];
    else
        return app.f[n]=factorial(n-1)*n;
}


//var factorial = [1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600, 6227020800, 87178291200, 1307674368000, 20922789888000, 355687428096000, 6402373705728000, 121645100408832000, 2432902008176640000, 51090942171709440000, 1124000727777607680000];

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
        this.player = new app.Player({id: this.model.get('player')});

        //update the showItemsAsList option checkbox once the player it's loaded
        this.player.bind('change',function(){
            that.player.unbind('change');

            if(that.player.get('showItemsAsList')){
                that.$('#showItemsAsList').attr('checked',true);
                that.$('#percentageToDrop').removeClass('hidden');
                that.$('#percentageInDeck').removeClass('hidden');
                that.$('.percentageOptionText').removeClass('hidden');
                console.log(that.player.get('percentageType'));
                if(that.player.get('percentageType')==0){
                    that.$('#percentageToDrop').attr('checked',true);
                }else if(that.player.get('percentageType')==1){
                    that.$('#percentageInDeck').attr('checked',true);
                }

            }else{
                that.$('#percentageToDrop').addClass('hidden');
                that.$('#percentageInDeck').addClass('hidden');
                that.$('.percentageOptionText').addClass('hidden');
            }
        });

        new app.PlayerView({model: this.player});


        this.show();


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
        'click button.change-password': 'changePassword',
        'change #showItemsAsList': 'showItemsAsList',
        'change #percentageToDrop': 'percentageToDrop',
        'change #percentageInDeck': 'percentageInDeck'


    },

    percentageInDeck: function(){

        app.currentPlayer.save({percentageType: 1});

        if(app.SelectedGameView.model){
            app.SelectedGameView.renderItemsDisplay(true);
        }



    },

    percentageToDrop: function(){

        app.currentPlayer.save({percentageType: 0});

        if(app.SelectedGameView.model){
            app.SelectedGameView.renderItemsDisplay(true);
        }



    },

    showItemsAsList: function(){


        var showItemsAsList = this.$('#showItemsAsList').attr('checked')?true:false;
        var percentageType = 0;

        if(showItemsAsList){
            this.$('#percentageToDrop').removeClass('hidden');
            this.$('#percentageInDeck').removeClass('hidden');
            this.$('.percentageOptionText').removeClass('hidden');

            if(this.player.get('percentageType')==0){
                this.$('#percentageToDrop').attr('checked',true);
                percentageType=0;
            }else if(this.player.get('percentageType')==1){
                this.$('#percentageInDeck').attr('checked',true);
                percentageType=1;
            }else{
                this.$('#percentageToDrop').attr('checked',true);
            }

        }else{
            this.$('#percentageToDrop').addClass('hidden');
            this.$('#percentageInDeck').addClass('hidden');
            this.$('.percentageOptionText').addClass('hidden');
        }

        app.currentPlayer.save({showItemsAsList: showItemsAsList, percentageType: percentageType});

        if(app.SelectedGameView.model){
            app.SelectedGameView.renderItemsDisplay(showItemsAsList);
        }
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

//        //verify if its a valid username before sending to the server
//        this.model.set({username: username}, {error: function(model,error){
//            that.$('.login-error').html(error);
//
//            withError = true;
//        }});

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
        var that = this;

        this.visible = false;
        this.$el.fadeTo(300,0, function(){
            that.$el.hide();
        });
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

        var that = this;

        this.spinner = new Spinner(opts_big);

        this.renderLoading();

        this.model.fetch({success: function(){

            that.model.loadEnemies();
            that.render();

        }});

        $('#current-game').resize(function(){
            $('#player').height($('#current-game').height());

//            $('#player').height('auto');
//            //.css({max-height: navHeight + 'px; });
//            if($('#current-game').height() > $('#player').height()){
//                $('#player').height($('#current-game').height());
//            }else{
//                $('#current-game').height($('#player').height());
//            }
        });

    },

    renderLoading: function(){

        this.$el.empty();
        this.$el.append(this.spinner.spin().el);


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

        this.collection.bind('add', this.enemyAdded, this);

        _.bindAll(this);

    },

    events: {
        'click #add-enemy':  'addEnemy',
        'keyup #filter': 'filter',
        'change #showActive': 'setShowOnlyActive',
        'change #showState': 'setShowState',
        'click .statistics': 'showStatistics'
    },

    showStatistics: function(){

        app.SelectionManager.unselectCurrentGame();
        app.SelectionManager.unselectCurrentEnemy();
        new app.StatisticsView({collection: this.collection}).render();

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

        var areHiddenEnemies = false;

        this.collection.each(function(enemy) {
            if(enemy.isVisible()){
                var view = new EnemyView({collection: this.collection, model: enemy});
                $enemies.append(view.render().el);
            }else{
                areHiddenEnemies = true;
            }

        },this);

        if(areHiddenEnemies){
            this.$('.hidden-enemies-warning').removeClass('hidden');
        }else{
            this.$('.hidden-enemies-warning').addClass('hidden');
        }

        //verify if the player have the option "Show state" marked
        if(this.collection.player.get('showState')){
            this.$('.game.won').addClass('showState');
            this.$('.game.lost').addClass('showState');
        }

        if(app.SelectionManager.selectedEnemy){
            //control to hide the selectect game if it is not visible after aplying a filter or active only filter
            if(!app.SelectionManager.selectedEnemy.isVisible() || !app.SelectionManager.selectedGame.isVisible()){
                app.SelectedGameView.hide();
            }else{
                app.SelectedGameView.show();
            }
        }

        $('#player').height('auto');
        $('#current-game').height('auto');
        if($('#current-game').height() > $('#player').height()){
            $('#player').height($('#current-game').height());
        }else{
            $('#current-game').height($('#player').height());
        }



    },


    addEnemy: function(){

        $('#player').height('auto');

        var $enemies = this.$(".enemies")

        app.AddEnemyView.enemies = this.collection;
        $enemies.prepend(app.AddEnemyView.render().el);
        app.AddEnemyView.focus();

    },

    enemyAdded: function(enemy){

        $('#player').height('auto');

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

        var areHiddenEnemies = false;

        //render all enemies
        this.collection.each(function(enemy) {
            if(enemy.isVisible()){
                var view = new EnemyView({collection: this.collection, model: enemy});
                $enemies.append(view.render().el);
            }else{
                areHiddenEnemies = true;
            }

        },this);

        if(areHiddenEnemies){
            this.$('.hidden-enemies-warning').removeClass('hidden');
        }else{
            this.$('.hidden-enemies-warning').addClass('hidden');
        }

        //verify if the player have the option "Show state" marked
        if(this.collection.player.get('showState')){
            this.$('#showState').attr('checked',true);
            this.$('.game.won').addClass('showState');
            this.$('.game.lost').addClass('showState');
        }


        return this;
    }

});

var StatisticsView = Backbone.View.extend({

    el: "#current-game",

    initialize: function() {
        _.bindAll(this);

        this.template = _.template($("#statistics-template").html())

    },

    render: function(){

        this.$el.html(new Spinner(opts_big).spin().el);

        var stats = this.collection.statistics();

        this.$el.html(this.template());


        this.$('div.enemyStatsName').html("Global Statistics");
        this.$('div.statsTotal .statsValue').html(stats.inProgress + stats.wins.total + stats.losses.total);
        this.$('div.statsInProgress .statsValue').html(stats.inProgress);
        this.$('div.statsWins .statsValue').html(stats.wins.total);
        this.$('div.statsLosses .statsValue').html(stats.losses.total);

        //*****************************************
        //*************** ENEMIES *****************
        //*****************************************

        var enemiesData = new google.visualization.DataTable();
        enemiesData.addColumn('string', 'Opponent');
        enemiesData.addColumn('number', 'Victories');
        enemiesData.addColumn('number', 'Defeats');
        enemiesData.addColumn('number', 'Ratio');
        _.each(stats.enemiesStats, function(enemyStats){
            enemiesData.addRow([enemyStats.name,  enemyStats.wins.total, enemyStats.losses.total, {v: enemyStats.ratio, f: enemyStats.ratio.toFixed(2)  + '%'}]);
        },this);
        enemiesData.addRow(['TOTAL',  stats.wins.total, stats.losses.total, {v: stats.ratio, f: stats.ratio.toFixed(2)  + '%'}]);

        var enemiesTable = new google.visualization.Table(document.getElementById('enemiesTable'));
        enemiesTable.draw(enemiesData, {'width':590});

        //if there are no games, don't show the charts
        if(stats.inProgress + stats.wins.total + stats.losses.total == 0){
            this.$('div.enemyGraphs').hide();
            return;
        }else{
            this.$('div.noCharts').hide();
        }



        //*****************************************
        //************* WINS by TYPE **************
        //*****************************************

        var winData = new google.visualization.DataTable();
        winData.addColumn('string', 'Type');
        winData.addColumn('number', 'Value');
        winData.addRows([
            ['Crystal', stats.wins.crystal],
            ['TKO', stats.wins.heroes],
            ['Surrender', stats.wins.surrender],
            ['Timeout', stats.wins.timeout]
        ]);

        // Set chart options
        var winOptions = {'title':'Victories by Type',
            'chartArea': {width: 280, height: 130},
            'titleTextStyle':{fontName: 'Lucida Grande' ,fontSize: 14}};

        // Instantiate and draw our chart, passing in some options.
        var winChart = new google.visualization.PieChart(document.getElementById('winsGraph'));
        winChart.draw(winData, winOptions);



        //*****************************************
        //*********** LOSSES by TYPE **************
        //*****************************************

        var lossData = new google.visualization.DataTable();
        lossData.addColumn('string', 'Type');
        lossData.addColumn('number', 'Value');
        lossData.addRows([
            ['Crystal', stats.losses.crystal],
            ['TKO', stats.losses.heroes],
            ['Surrender', stats.losses.surrender],
            ['Timeout', stats.losses.timeout]
        ]);

        // Set chart options
        var lossOptions = {'title':'Defeats by Type',
            'chartArea': {width: 280, height: 130},
            'titleTextStyle':{fontName: 'Lucida Grande' ,fontSize: 14}};

        // Instantiate and draw our chart, passing in some options.
        var lossChart = new google.visualization.PieChart(document.getElementById('lossesGraph'));
        lossChart.draw(lossData, lossOptions);

        //*****************************************
        //*************** COUNCIL *****************
        //*****************************************

        var councilData = new google.visualization.DataTable();
        councilData.addColumn('string', 'vs Race');
        councilData.addColumn('number', 'Victories');
        councilData.addColumn('number', 'Defeats');
        councilData.addColumn('number', 'Ratio');
        councilData.addRows([
            ['Council',  stats.council.council_wins, stats.council.council_losses, {v: stats.council.council_ratio, f: stats.council.council_ratio.toFixed(2)  + '%'}],
            ['Dark Elves',  stats.council.darkelves_wins, stats.council.darkelves_losses, {v: stats.council.darkelves_ratio, f: stats.council.darkelves_ratio.toFixed(2)  + '%'}],
            ['Dwarves',  stats.council.dwarves_wins, stats.council.dwarves_losses, {v: stats.council.dwarves_ratio, f: stats.council.dwarves_ratio.toFixed(2)  + '%'}],
            ['Tribe',  stats.council.tribe_wins, stats.council.tribe_losses, {v: stats.council.tribe_ratio, f: stats.council.tribe_ratio.toFixed(2)  + '%'}],
            ['TF2',  stats.council.tf2_wins, stats.council.tf2_losses, {v: stats.council.tf2_ratio, f: stats.council.tf2_ratio.toFixed(2)  + '%'}],
            ['Shaolin',  stats.council.shaolin_wins, stats.council.shaolin_losses, {v: stats.council.shaolin_ratio, f: stats.council.shaolin_ratio.toFixed(2)  + '%'}],
            ['TOTAL',  stats.council.wins, stats.council.losses, {v: stats.council.ratio, f: stats.council.ratio.toFixed(2)  + '%'}]
        ]);

        var councilTable = new google.visualization.Table(document.getElementById('councilTable'));
        councilTable.draw(councilData, {'width':270, 'height':200});

        councilData.removeColumn(3);
        councilData.removeRow(6);

        var councilChart = new google.visualization.ColumnChart(document.getElementById('councilTable2'));
        councilChart.draw(councilData, {'isStacked': true,'width':320,'height':200,colors: ['green', 'red'],legend: {position: 'top'}});


        //*****************************************
        //************* DARK ELVES ****************
        //*****************************************

        var darkelvesData = new google.visualization.DataTable();
        darkelvesData.addColumn('string', 'vs Race');
        darkelvesData.addColumn('number', 'Victories');
        darkelvesData.addColumn('number', 'Defeats');
        darkelvesData.addColumn('number', 'Ratio');
        darkelvesData.addRows([
            ['Council',  stats.darkelves.council_wins, stats.darkelves.council_losses, {v: stats.darkelves.council_ratio, f: stats.darkelves.council_ratio.toFixed(2)  + '%'}],
            ['Dark Elves',  stats.darkelves.darkelves_wins, stats.darkelves.darkelves_losses, {v: stats.darkelves.darkelves_ratio, f: stats.darkelves.darkelves_ratio.toFixed(2)  + '%'}],
            ['Dwarves',  stats.darkelves.dwarves_wins, stats.darkelves.dwarves_losses, {v: stats.darkelves.dwarves_ratio, f: stats.darkelves.dwarves_ratio.toFixed(2)  + '%'}],
            ['Tribe',  stats.darkelves.tribe_wins, stats.darkelves.tribe_losses, {v: stats.darkelves.tribe_ratio, f: stats.darkelves.tribe_ratio.toFixed(2)  + '%'}],
            ['TF2',  stats.darkelves.tf2_wins, stats.darkelves.tf2_losses, {v: stats.darkelves.tf2_ratio, f: stats.darkelves.tf2_ratio.toFixed(2)  + '%'}],
            ['Shaolin',  stats.darkelves.shaolin_wins, stats.darkelves.shaolin_losses, {v: stats.darkelves.shaolin_ratio, f: stats.darkelves.shaolin_ratio.toFixed(2)  + '%'}],
            ['TOTAL',  stats.darkelves.wins, stats.darkelves.losses, {v: stats.darkelves.ratio, f: stats.darkelves.ratio.toFixed(2)  + '%'}]
            
        ]);

        var darkelvesTable = new google.visualization.Table(document.getElementById('darkelvesTable'));
        darkelvesTable.draw(darkelvesData, {'width':270, 'height':200});

        darkelvesData.removeColumn(3);
        darkelvesData.removeRow(6);

        var darkelvesChart = new google.visualization.ColumnChart(document.getElementById('darkelvesTable2'));
        darkelvesChart.draw(darkelvesData, {'isStacked': true,'width':320,'height':200,colors: ['green', 'red'],legend: {position: 'top'} });

        //*****************************************
        //*************** DWARVES *****************
        //*****************************************

        var dwarvesData = new google.visualization.DataTable();
        dwarvesData.addColumn('string', 'vs Race');
        dwarvesData.addColumn('number', 'Victories');
        dwarvesData.addColumn('number', 'Defeats');
        dwarvesData.addColumn('number', 'Ratio');
        dwarvesData.addRows([
            ['Council',  stats.dwarves.council_wins, stats.dwarves.council_losses, {v: stats.dwarves.council_ratio, f: stats.dwarves.council_ratio.toFixed(2)  + '%'}],
            ['Dark Elves',  stats.dwarves.darkelves_wins, stats.dwarves.darkelves_losses, {v: stats.dwarves.darkelves_ratio, f: stats.dwarves.darkelves_ratio.toFixed(2)  + '%'}],
            ['Dwarves',  stats.dwarves.dwarves_wins, stats.dwarves.dwarves_losses, {v: stats.dwarves.dwarves_ratio, f: stats.dwarves.dwarves_ratio.toFixed(2)  + '%'}],
            ['Tribe',  stats.dwarves.tribe_wins, stats.dwarves.tribe_losses, {v: stats.dwarves.tribe_ratio, f: stats.dwarves.tribe_ratio.toFixed(2)  + '%'}],
            ['TF2',  stats.dwarves.tf2_wins, stats.dwarves.tf2_losses, {v: stats.dwarves.tf2_ratio, f: stats.dwarves.tf2_ratio.toFixed(2)  + '%'}],
            ['Shaolin',  stats.dwarves.shaolin_wins, stats.dwarves.shaolin_losses, {v: stats.dwarves.shaolin_ratio, f: stats.dwarves.shaolin_ratio.toFixed(2)  + '%'}],
            ['TOTAL',  stats.dwarves.wins, stats.dwarves.losses, {v: stats.dwarves.ratio, f: stats.dwarves.ratio.toFixed(2)  + '%'}]
        ]);

        var dwarvesTable = new google.visualization.Table(document.getElementById('dwarvesTable'));
        dwarvesTable.draw(dwarvesData, {'width':270, 'height':200});

        dwarvesData.removeColumn(3);
        dwarvesData.removeRow(6);

        var dwarvesChart = new google.visualization.ColumnChart(document.getElementById('dwarvesTable2'));
        dwarvesChart.draw(dwarvesData, {'isStacked': true,'width':320,'height':200,colors: ['green', 'red'],legend: {position: 'top'} });

        //*****************************************
        //**************** TRIBE ******************
        //*****************************************

        var tribeData = new google.visualization.DataTable();
        tribeData.addColumn('string', 'vs Race');
        tribeData.addColumn('number', 'Victories');
        tribeData.addColumn('number', 'Defeats');
        tribeData.addColumn('number', 'Ratio');
        tribeData.addRows([
            ['Council',  stats.tribe.council_wins, stats.tribe.council_losses, {v: stats.tribe.council_ratio, f: stats.tribe.council_ratio.toFixed(2)  + '%'}],
            ['Dark Elves',  stats.tribe.darkelves_wins, stats.tribe.darkelves_losses, {v: stats.tribe.darkelves_ratio, f: stats.tribe.darkelves_ratio.toFixed(2)  + '%'}],
            ['Dwarves',  stats.tribe.dwarves_wins, stats.tribe.dwarves_losses, {v: stats.tribe.dwarves_ratio, f: stats.tribe.dwarves_ratio.toFixed(2)  + '%'}],
            ['Tribe',  stats.tribe.tribe_wins, stats.tribe.tribe_losses, {v: stats.tribe.tribe_ratio, f: stats.tribe.tribe_ratio.toFixed(2)  + '%'}],
            ['TF2',  stats.tribe.tf2_wins, stats.tribe.tf2_losses, {v: stats.tribe.tf2_ratio, f: stats.tribe.tf2_ratio.toFixed(2)  + '%'}],
            ['Shaolin',  stats.tribe.shaolin_wins, stats.tribe.shaolin_losses, {v: stats.tribe.shaolin_ratio, f: stats.tribe.shaolin_ratio.toFixed(2)  + '%'}],
            ['TOTAL',  stats.tribe.wins, stats.tribe.losses, {v: stats.tribe.ratio, f: stats.tribe.ratio.toFixed(2)  + '%'}]
        ]);

        var tribeTable = new google.visualization.Table(document.getElementById('tribeTable'));
        tribeTable.draw(tribeData, {'width':270, 'height':200});

        tribeData.removeColumn(3);
        tribeData.removeRow(6);

        var tribeChart = new google.visualization.ColumnChart(document.getElementById('tribeTable2'));
        tribeChart.draw(tribeData, {'isStacked': true,'width':320,'height':200,colors: ['green', 'red'],legend: {position: 'top'} });


        //*****************************************
        //***************** TF2 *******************
        //*****************************************

        var tf2Data = new google.visualization.DataTable();
        tf2Data.addColumn('string', 'vs Race');
        tf2Data.addColumn('number', 'Victories');
        tf2Data.addColumn('number', 'Defeats');
        tf2Data.addColumn('number', 'Ratio');
        tf2Data.addRows([
            ['Council',  stats.tf2.council_wins, stats.tf2.council_losses, {v: stats.tf2.council_ratio, f: stats.tf2.council_ratio.toFixed(2)  + '%'}],
            ['Dark Elves',  stats.tf2.darkelves_wins, stats.tf2.darkelves_losses, {v: stats.tf2.darkelves_ratio, f: stats.tf2.darkelves_ratio.toFixed(2)  + '%'}],
            ['Dwarves',  stats.tf2.dwarves_wins, stats.tf2.dwarves_losses, {v: stats.tf2.dwarves_ratio, f: stats.tf2.dwarves_ratio.toFixed(2)  + '%'}],
            ['Tribe',  stats.tf2.tribe_wins, stats.tf2.tribe_losses, {v: stats.tf2.tribe_ratio, f: stats.tf2.tribe_ratio.toFixed(2)  + '%'}],
            ['TF2',  stats.tf2.tf2_wins, stats.tf2.tf2_losses, {v: stats.tf2.tf2_ratio, f: stats.tf2.tf2_ratio.toFixed(2)  + '%'}],
            ['Shaolin',  stats.tf2.shaolin_wins, stats.tf2.shaolin_losses, {v: stats.tf2.shaolin_ratio, f: stats.tf2.shaolin_ratio.toFixed(2)  + '%'}],
            ['TOTAL',  stats.tf2.wins, stats.tf2.losses, {v: stats.tf2.ratio, f: stats.tf2.ratio.toFixed(2)  + '%'}]
        ]);

        var tf2Table = new google.visualization.Table(document.getElementById('tf2Table'));
        tf2Table.draw(tf2Data, {'width':270, 'height':200});

        tf2Data.removeColumn(3);
        tf2Data.removeRow(6);

        var tf2Chart = new google.visualization.ColumnChart(document.getElementById('tf2Table2'));
        tf2Chart.draw(tf2Data, {'isStacked': true,'width':320,'height':200,colors: ['green', 'red'],legend: {position: 'top'} });


        //*****************************************
        //*************** Shaolin *****************
        //*****************************************

        var shaolinData = new google.visualization.DataTable();
        shaolinData.addColumn('string', 'vs Race');
        shaolinData.addColumn('number', 'Victories');
        shaolinData.addColumn('number', 'Defeats');
        shaolinData.addColumn('number', 'Ratio');
        shaolinData.addRows([
            ['Council',  stats.shaolin.council_wins, stats.shaolin.council_losses, {v: stats.shaolin.council_ratio, f: stats.shaolin.council_ratio.toFixed(2)  + '%'}],
            ['Dark Elves',  stats.shaolin.darkelves_wins, stats.shaolin.darkelves_losses, {v: stats.shaolin.darkelves_ratio, f: stats.shaolin.darkelves_ratio.toFixed(2)  + '%'}],
            ['Dwarves',  stats.shaolin.dwarves_wins, stats.shaolin.dwarves_losses, {v: stats.shaolin.dwarves_ratio, f: stats.shaolin.dwarves_ratio.toFixed(2)  + '%'}],
            ['Tribe',  stats.shaolin.tribe_wins, stats.shaolin.tribe_losses, {v: stats.shaolin.tribe_ratio, f: stats.shaolin.tribe_ratio.toFixed(2)  + '%'}],
            ['TF2',  stats.shaolin.tf2_wins, stats.shaolin.tf2_losses, {v: stats.shaolin.tf2_ratio, f: stats.shaolin.tf2_ratio.toFixed(2)  + '%'}],
            ['Shaolin',  stats.shaolin.shaolin_wins, stats.shaolin.shaolin_losses, {v: stats.shaolin.shaolin_ratio, f: stats.shaolin.shaolin_ratio.toFixed(2)  + '%'}],
            ['TOTAL',  stats.shaolin.wins, stats.shaolin.losses, {v: stats.shaolin.ratio, f: stats.shaolin.ratio.toFixed(2)  + '%'}]
        ]);

        var shaolinTable = new google.visualization.Table(document.getElementById('shaolinTable'));
        shaolinTable.draw(shaolinData, {'width':270, 'height':200});

        shaolinData.removeColumn(3);
        shaolinData.removeRow(6);

        var shaolinChart = new google.visualization.ColumnChart(document.getElementById('shaolinTable2'));
        shaolinChart.draw(shaolinData, {'isStacked': true,'width':320,'height':200,colors: ['green', 'red'],legend: {position: 'top'} });


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

        this.model.bind('change:selected', this.renderSelected,this);

        this.model.bind('change:unselected', this.renderUnselected,this);

        //this.model.games.bind('change:selected', this.renderSelected,this);

        //this.model.games.bind('change:unselected', this.renderUnselected,this);

        this.spinner = new Spinner(opts_small);

    },

    events: {
        'click .add-game':  'addGame',
        'click .deleteEnemy': 'deleteEnemy',
        'click .delete-enemy-yes': 'confirmDeleteEnemy',
        'click .delete-enemy-no': 'denyDeleteEnemy',
        'keyup .newEnemyName': 'confirmRenameEnemy',
        'click .enemyName': 'clickRouter'
    },

    clickRouter: function(){

        var nowTime = new Date().getTime();
        var that = this;

        //verify if its a double click (interval between clicks < 200ms)
        if(this.clickTime && nowTime - this.clickTime < 200 ){
            clearTimeout(this.timer);
            this.renameEnemy();
        //if only occurred one click waits 200ms for a second one. If no second click, select the enemy
        }else{
            this.timer = setTimeout(function(){
                that.selectEnemy();
            },200);

        }

        this.clickTime = nowTime;


    },

    selectEnemy: function(){
        app.SelectionManager.unselectCurrentGame();
        app.SelectionManager.setSelectedEnemy(this.model);
        new app.SelectedEnemyView({model: this.model}).render();
    },

    addGame: function(){

        $('#player').height('auto');

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

        this.$('.enemyName').hide();
        this.$('.newEnemyName').removeClass('hidden');

        this.$('.newEnemyName').focus();
    },

    cancelRenameEnemy: function(){

        this.$('.newEnemyName').addClass('hidden');
        this.$('.enemyName').show();

        this.$('.enemyExists').addClass('hidden');

    },


    confirmRenameEnemy: function(evt){

        var that = this;

        //ENTER
        if(evt.keyCode == 13){

            if(this.$('.newEnemyName').val().length != 0 && !this.collection.exists(this.$('.newEnemyName').val())){

                this.$('.newEnemyName').addClass('hidden');
                this.$('.enemyName').show();

                this.$('.enemyName').html(this.spinner.spin().el);

                this.model.save({name: this.$('.newEnemyName').val()},{success: function(){

                    that.$('.enemyExists').addClass('hidden');

                    that.$('.enemyName').html(that.model.get('name'));
                }, error: simpleErrorHandler});

            }else if(this.$('.newEnemyName').val() == this.$('.enemyName').html()){
                this.$('.enemyExists').addClass('hidden');

                this.$('.newEnemyName').addClass('hidden');

                this.$('.enemyName').show();

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

var SelectedEnemyView = Backbone.View.extend({

    el: "#current-game",

    initialize: function() {
        _.bindAll(this);

        this.template = _.template($("#selected-enemy-template").html())

    },

    render: function(){

        this.$el.html(this.template());

        var stats = this.model.statistics();


        this.$('div.enemyStatsName').html(this.model.get('name'));
        this.$('div.statsTotal .statsValue').html(stats.inProgress + stats.wins.total + stats.losses.total);
        this.$('div.statsInProgress .statsValue').html(stats.inProgress);
        this.$('div.statsWins .statsValue').html(stats.wins.total);
        this.$('div.statsLosses .statsValue').html(stats.losses.total);


        //if there are no games, don't show the charts
        if(stats.inProgress + stats.wins.total + stats.losses.total == 0){
            this.$('div.enemyGraphs').hide();
            return;
        }else{
            this.$('div.noCharts').hide();
        }


        //*****************************************
        //************* WINS by TYPE **************
        //*****************************************

        var winData = new google.visualization.DataTable();
        winData.addColumn('string', 'Type');
        winData.addColumn('number', 'Value');
        winData.addRows([
            ['Crystal', stats.wins.crystal],
            ['TKO', stats.wins.heroes],
            ['Surrender', stats.wins.surrender],
            ['Timeout', stats.wins.timeout]
        ]);

        // Set chart options
        var winOptions = {'title':'Victories by Type',
            'chartArea': {width: 280, height: 130},
            'titleTextStyle':{fontName: 'Lucida Grande' ,fontSize: 14}};

        // Instantiate and draw our chart, passing in some options.
        var winChart = new google.visualization.PieChart(document.getElementById('winsGraph'));
        winChart.draw(winData, winOptions);


        //*****************************************
        //*********** LOSSES by TYPE **************
        //*****************************************

        var lossData = new google.visualization.DataTable();
        lossData.addColumn('string', 'Type');
        lossData.addColumn('number', 'Value');
        lossData.addRows([
            ['Crystal', stats.losses.crystal],
            ['TKO', stats.losses.heroes],
            ['Surrender', stats.losses.surrender],
            ['Timeout', stats.losses.timeout]
        ]);

        // Set chart options
        var lossOptions = {'title':'Defeats by Type',
            'chartArea': {width: 280, height: 130},
            'titleTextStyle':{fontName: 'Lucida Grande' ,fontSize: 14}};

        // Instantiate and draw our chart, passing in some options.
        var lossChart = new google.visualization.PieChart(document.getElementById('lossesGraph'));
        lossChart.draw(lossData, lossOptions);

        //*****************************************
        //*************** COUNCIL *****************
        //*****************************************

        var councilData = new google.visualization.DataTable();
        councilData.addColumn('string', 'vs Race');
        councilData.addColumn('number', 'Victories');
        councilData.addColumn('number', 'Defeats');
        councilData.addColumn('number', 'Ratio');
        councilData.addRows([
            ['Council',  stats.council.council_wins, stats.council.council_losses, {v: stats.council.council_ratio, f: stats.council.council_ratio.toFixed(2)  + '%'}],
            ['Dark Elves',  stats.council.darkelves_wins, stats.council.darkelves_losses, {v: stats.council.darkelves_ratio, f: stats.council.darkelves_ratio.toFixed(2)  + '%'}],
            ['Dwarves',  stats.council.dwarves_wins, stats.council.dwarves_losses, {v: stats.council.dwarves_ratio, f: stats.council.dwarves_ratio.toFixed(2)  + '%'}],
            ['Tribe',  stats.council.tribe_wins, stats.council.tribe_losses, {v: stats.council.tribe_ratio, f: stats.council.tribe_ratio.toFixed(2)  + '%'}],
            ['TF2',  stats.council.tf2_wins, stats.council.tf2_losses, {v: stats.council.tf2_ratio, f: stats.council.tf2_ratio.toFixed(2)  + '%'}],
            ['Shaolin',  stats.council.shaolin_wins, stats.council.shaolin_losses, {v: stats.council.shaolin_ratio, f: stats.council.shaolin_ratio.toFixed(2)  + '%'}],
            ['TOTAL',  stats.council.wins, stats.council.losses, {v: stats.council.ratio, f: stats.council.ratio.toFixed(2)  + '%'}]
        ]);

        var councilTable = new google.visualization.Table(document.getElementById('councilTable'));
        councilTable.draw(councilData, {'width':270, 'height':200});

        councilData.removeColumn(3);
        councilData.removeRow(6);

        var councilChart = new google.visualization.ColumnChart(document.getElementById('councilTable2'));
        councilChart.draw(councilData, {'isStacked': true,'width':320,'height':200,colors: ['green', 'red'],legend: {position: 'top'}});


        //*****************************************
        //************* DARK ELVES ****************
        //*****************************************

        var darkelvesData = new google.visualization.DataTable();
        darkelvesData.addColumn('string', 'vs Race');
        darkelvesData.addColumn('number', 'Victories');
        darkelvesData.addColumn('number', 'Defeats');
        darkelvesData.addColumn('number', 'Ratio');
        darkelvesData.addRows([
            ['Council',  stats.darkelves.council_wins, stats.darkelves.council_losses, {v: stats.darkelves.council_ratio, f: stats.darkelves.council_ratio.toFixed(2)  + '%'}],
            ['Dark Elves',  stats.darkelves.darkelves_wins, stats.darkelves.darkelves_losses, {v: stats.darkelves.darkelves_ratio, f: stats.darkelves.darkelves_ratio.toFixed(2)  + '%'}],
            ['Dwarves',  stats.darkelves.dwarves_wins, stats.darkelves.dwarves_losses, {v: stats.darkelves.dwarves_ratio, f: stats.darkelves.dwarves_ratio.toFixed(2)  + '%'}],
            ['Tribe',  stats.darkelves.tribe_wins, stats.darkelves.tribe_losses, {v: stats.darkelves.tribe_ratio, f: stats.darkelves.tribe_ratio.toFixed(2)  + '%'}],
            ['TF2',  stats.darkelves.tf2_wins, stats.darkelves.tf2_losses, {v: stats.darkelves.tf2_ratio, f: stats.darkelves.tf2_ratio.toFixed(2)  + '%'}],
            ['Shaolin',  stats.darkelves.shaolin_wins, stats.darkelves.shaolin_losses, {v: stats.darkelves.shaolin_ratio, f: stats.darkelves.shaolin_ratio.toFixed(2)  + '%'}],
            ['TOTAL',  stats.darkelves.wins, stats.darkelves.losses, {v: stats.darkelves.ratio, f: stats.darkelves.ratio.toFixed(2)  + '%'}]
        ]);

        var darkelvesTable = new google.visualization.Table(document.getElementById('darkelvesTable'));
        darkelvesTable.draw(darkelvesData, {'width':270, 'height':200});

        darkelvesData.removeColumn(3);
        darkelvesData.removeRow(6);

        var darkelvesChart = new google.visualization.ColumnChart(document.getElementById('darkelvesTable2'));
        darkelvesChart.draw(darkelvesData, {'isStacked': true,'width':320,'height':200,colors: ['green', 'red'],legend: {position: 'top'} });

        //*****************************************
        //*************** DWARVES *****************
        //*****************************************

        var dwarvesData = new google.visualization.DataTable();
        dwarvesData.addColumn('string', 'vs Race');
        dwarvesData.addColumn('number', 'Victories');
        dwarvesData.addColumn('number', 'Defeats');
        dwarvesData.addColumn('number', 'Ratio');
        dwarvesData.addRows([
            ['Council',  stats.dwarves.council_wins, stats.dwarves.council_losses, {v: stats.dwarves.council_ratio, f: stats.dwarves.council_ratio.toFixed(2)  + '%'}],
            ['Dark Elves',  stats.dwarves.darkelves_wins, stats.dwarves.darkelves_losses, {v: stats.dwarves.darkelves_ratio, f: stats.dwarves.darkelves_ratio.toFixed(2)  + '%'}],
            ['Dwarves',  stats.dwarves.dwarves_wins, stats.dwarves.dwarves_losses, {v: stats.dwarves.dwarves_ratio, f: stats.dwarves.dwarves_ratio.toFixed(2)  + '%'}],
            ['Tribe',  stats.dwarves.tribe_wins, stats.dwarves.tribe_losses, {v: stats.dwarves.tribe_ratio, f: stats.dwarves.tribe_ratio.toFixed(2)  + '%'}],
            ['TF2',  stats.dwarves.tf2_wins, stats.dwarves.tf2_losses, {v: stats.dwarves.tf2_ratio, f: stats.dwarves.tf2_ratio.toFixed(2)  + '%'}],
            ['Shaolin',  stats.dwarves.shaolin_wins, stats.dwarves.shaolin_losses, {v: stats.dwarves.shaolin_ratio, f: stats.dwarves.shaolin_ratio.toFixed(2)  + '%'}],
            ['TOTAL',  stats.dwarves.wins, stats.dwarves.losses, {v: stats.dwarves.ratio, f: stats.dwarves.ratio.toFixed(2)  + '%'}]
        ]);

        var dwarvesTable = new google.visualization.Table(document.getElementById('dwarvesTable'));
        dwarvesTable.draw(dwarvesData, {'width':270, 'height':200});

        dwarvesData.removeColumn(3);
        dwarvesData.removeRow(6);

        var dwarvesChart = new google.visualization.ColumnChart(document.getElementById('dwarvesTable2'));
        dwarvesChart.draw(dwarvesData, {'isStacked': true,'width':320,'height':200,colors: ['green', 'red'],legend: {position: 'top'} });

        //*****************************************
        //**************** TRIBE ******************
        //*****************************************

        var tribeData = new google.visualization.DataTable();
        tribeData.addColumn('string', 'vs Race');
        tribeData.addColumn('number', 'Victories');
        tribeData.addColumn('number', 'Defeats');
        tribeData.addColumn('number', 'Ratio');
        tribeData.addRows([
            ['Council',  stats.tribe.council_wins, stats.tribe.council_losses, {v: stats.tribe.council_ratio, f: stats.tribe.council_ratio.toFixed(2)  + '%'}],
            ['Dark Elves',  stats.tribe.darkelves_wins, stats.tribe.darkelves_losses, {v: stats.tribe.darkelves_ratio, f: stats.tribe.darkelves_ratio.toFixed(2)  + '%'}],
            ['Dwarves',  stats.tribe.dwarves_wins, stats.tribe.dwarves_losses, {v: stats.tribe.dwarves_ratio, f: stats.tribe.dwarves_ratio.toFixed(2)  + '%'}],
            ['Tribe',  stats.tribe.tribe_wins, stats.tribe.tribe_losses, {v: stats.tribe.tribe_ratio, f: stats.tribe.tribe_ratio.toFixed(2)  + '%'}],
            ['TF2',  stats.tribe.tf2_wins, stats.tribe.tf2_losses, {v: stats.tribe.tf2_ratio, f: stats.tribe.tf2_ratio.toFixed(2)  + '%'}],
            ['Shaolin',  stats.tribe.shaolin_wins, stats.tribe.shaolin_losses, {v: stats.tribe.shaolin_ratio, f: stats.tribe.shaolin_ratio.toFixed(2)  + '%'}],
            ['TOTAL',  stats.tribe.wins, stats.tribe.losses, {v: stats.tribe.ratio, f: stats.tribe.ratio.toFixed(2)  + '%'}]
        ]);

        var tribeTable = new google.visualization.Table(document.getElementById('tribeTable'));
        tribeTable.draw(tribeData, {'width':270, 'height':200});

        tribeData.removeColumn(3);
        tribeData.removeRow(6);

        var tribeChart = new google.visualization.ColumnChart(document.getElementById('tribeTable2'));
        tribeChart.draw(tribeData, {'isStacked': true,'width':320,'height':200,colors: ['green', 'red'],legend: {position: 'top'} });

        //*****************************************
        //***************** TF2 *******************
        //*****************************************

        var tf2Data = new google.visualization.DataTable();
        tf2Data.addColumn('string', 'vs Race');
        tf2Data.addColumn('number', 'Victories');
        tf2Data.addColumn('number', 'Defeats');
        tf2Data.addColumn('number', 'Ratio');
        tf2Data.addRows([
            ['Council',  stats.tf2.council_wins, stats.tf2.council_losses, {v: stats.tf2.council_ratio, f: stats.tf2.council_ratio.toFixed(2)  + '%'}],
            ['Dark Elves',  stats.tf2.darkelves_wins, stats.tf2.darkelves_losses, {v: stats.tf2.darkelves_ratio, f: stats.tf2.darkelves_ratio.toFixed(2)  + '%'}],
            ['Dwarves',  stats.tf2.dwarves_wins, stats.tf2.dwarves_losses, {v: stats.tf2.dwarves_ratio, f: stats.tf2.dwarves_ratio.toFixed(2)  + '%'}],
            ['Tribe',  stats.tf2.tribe_wins, stats.tf2.tribe_losses, {v: stats.tf2.tribe_ratio, f: stats.tf2.tribe_ratio.toFixed(2)  + '%'}],
            ['TF2',  stats.tf2.tf2_wins, stats.tf2.tf2_losses, {v: stats.tf2.tf2_ratio, f: stats.tf2.tf2_ratio.toFixed(2)  + '%'}],
            ['Shaolin',  stats.tf2.shaolin_wins, stats.tf2.shaolin_losses, {v: stats.tf2.shaolin_ratio, f: stats.tf2.shaolin_ratio.toFixed(2)  + '%'}],
            ['TOTAL',  stats.tf2.wins, stats.tf2.losses, {v: stats.tf2.ratio, f: stats.tf2.ratio.toFixed(2)  + '%'}]
        ]);

        var tf2Table = new google.visualization.Table(document.getElementById('tf2Table'));
        tf2Table.draw(tf2Data, {'width':270, 'height':200});

        tf2Data.removeColumn(3);
        tf2Data.removeRow(6);

        var tf2Chart = new google.visualization.ColumnChart(document.getElementById('tf2Table2'));
        tf2Chart.draw(tf2Data, {'isStacked': true,'width':320,'height':200,colors: ['green', 'red'],legend: {position: 'top'} });

        //*****************************************
        //*************** Shaolin *****************
        //*****************************************

        var shaolinData = new google.visualization.DataTable();
        shaolinData.addColumn('string', 'vs Race');
        shaolinData.addColumn('number', 'Victories');
        shaolinData.addColumn('number', 'Defeats');
        shaolinData.addColumn('number', 'Ratio');
        shaolinData.addRows([
            ['Council',  stats.shaolin.council_wins, stats.shaolin.council_losses, {v: stats.shaolin.council_ratio, f: stats.shaolin.council_ratio.toFixed(2)  + '%'}],
            ['Dark Elves',  stats.shaolin.darkelves_wins, stats.shaolin.darkelves_losses, {v: stats.shaolin.darkelves_ratio, f: stats.shaolin.darkelves_ratio.toFixed(2)  + '%'}],
            ['Dwarves',  stats.shaolin.dwarves_wins, stats.shaolin.dwarves_losses, {v: stats.shaolin.dwarves_ratio, f: stats.shaolin.dwarves_ratio.toFixed(2)  + '%'}],
            ['Tribe',  stats.shaolin.tribe_wins, stats.shaolin.tribe_losses, {v: stats.shaolin.tribe_ratio, f: stats.shaolin.tribe_ratio.toFixed(2)  + '%'}],
            ['TF2',  stats.shaolin.tf2_wins, stats.shaolin.tf2_losses, {v: stats.shaolin.tf2_ratio, f: stats.shaolin.tf2_ratio.toFixed(2)  + '%'}],
            ['Shaolin',  stats.shaolin.shaolin_wins, stats.shaolin.shaolin_losses, {v: stats.shaolin.shaolin_ratio, f: stats.shaolin.shaolin_ratio.toFixed(2)  + '%'}],
            ['TOTAL',  stats.shaolin.wins, stats.shaolin.losses, {v: stats.shaolin.ratio, f: stats.shaolin.ratio.toFixed(2)  + '%'}]
        ]);

        var shaolinTable = new google.visualization.Table(document.getElementById('shaolinTable'));
        shaolinTable.draw(shaolinData, {'width':270, 'height':200});

        shaolinData.removeColumn(3);
        shaolinData.removeRow(6);

        var shaolinChart = new google.visualization.ColumnChart(document.getElementById('shaolinTable2'));
        shaolinChart.draw(shaolinData, {'isStacked': true,'width':320,'height':200,colors: ['green', 'red'],legend: {position: 'top'} });

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

        game.unbind("sync",this.createdGame);

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

//        $('#player').resize(function(){
//
//            $('#current-game').height('auto');
//            if($('#player').height() > $('#current-game').height()){
//                $('#current-game').height($('#player').height());
//            }
//        });

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

    renderAsItemList: function(){

        this.$('.items-panel').removeClass('itemTable');
        this.$('.player-items-mask').removeClass('itemTable');
        this.$('.player-items').removeClass('itemTable');
        this.$('.enemy-items-mask').removeClass('itemTable');
        this.$('.enemy-items').removeClass('itemTable');

        this.$('.items-panel').addClass('itemList');
        this.$('.player-items-mask').addClass('itemList');
        this.$('.player-items').addClass('itemList');
        this.$('.enemy-items-mask').addClass('itemList');
        this.$('.enemy-items').addClass('itemList');

    },

    renderAsItemTable: function(){

        this.$('.items-panel').removeClass('itemList');
        this.$('.player-items-mask').removeClass('itemList');
        this.$('.player-items').removeClass('itemList');
        this.$('.enemy-items-mask').removeClass('itemList');
        this.$('.enemy-items').removeClass('itemList');

        this.$('.items-panel').addClass('itemTable');
        this.$('.player-items-mask').addClass('itemTable');
        this.$('.player-items').addClass('itemTable');
        this.$('.enemy-items-mask').addClass('itemTable');
        this.$('.enemy-items').addClass('itemTable');

    },

    renderItemsDisplay: function(asList){

        if(asList){
            this.renderAsItemList();
        }else{
            this.renderAsItemTable();
        }

        this.playerItems.renderItemsDisplay(asList);
        this.enemyItems.renderItemsDisplay(asList);

    },


    render: function(){

        this.show();

        if(this.model){

            var json = this.model.toJSON();

            this.$el.html(this.template({data: json}));

            this.playerItems = new PlayerItemsView({collection: this.model.playerItems, model: this.model});
            this.enemyItems = new EnemyItemsView({collection: this.model.enemyItems, model: this.model});

            this.gameNotes = new GameNotesView({collection: this.model.gameNotes, model: this.model});

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

            this.$el.height('auto');

            $items_panel.append(this.playerItems.render().el);
            $items_panel.append(this.enemyItems.render().el);

            this.$('.gameNotesPanel').append(this.gameNotes.render().el);


            if(app.currentPlayer.get('showItemsAsList')){
                this.renderAsItemList();
            }else{
                this.renderAsItemTable();
            }

        }else{

            this.$el.html(this.template({data: undefined}));

        }



        return this;
    }

});

var GameNotesView = Backbone.View.extend({

    class: "gameNotes",

    initialize: function(){

        this.template = _.template($("#game-notes-template").html());

        _.bindAll(this);

        this.spinner = new Spinner(opts_medium);

        this.collection.bind("reset",this.renderNotes,this);

        this.collection.bind("remove",this.nodeRemoved,this);

    },

    events: {
        'click .addNoteButton': 'addNote',
        'keydown .addNoteText': 'pressEnter'
    },

    pressEnter: function(evt){
        if(evt.ctrlKey && evt.keyCode == 13){
            this.addNote();

            evt.preventDefault();
        }else{
            this.$('div.addNoteTip').show();
        }
    },

    addNote: function(){


        if(this.$('.addNoteText').val()==''){
            return;
        }

        var that = this;

        this.$('div.addNoteTip').hide();

        //if the current-game if bigger of the same size of the enemy, try to increase
        //its size when adding a new note
        if($('#current-game').height() >= $('#player').height()){
            $('#current-game').height('auto');
        }

        var that = this;

        var note = new app.GameNote({note: this.$('.addNoteText').val()});

        this.collection.create(note,{wait:true, success: function(){

            that.$('.notesPanel').show();

            var nodeView = new GameNoteView({model: note});

            that.$('ul.notes').prepend(nodeView.render().el);

            that.$('.addNoteText').val('');



        }});


    },

    nodeRemoved: function(){

        if(this.collection.length == 0){
            this.renderNotes();
        }

    },


    renderNotes: function(){

        if(this.collection.length == 0){
            this.$('.notesPanel').hide();
            return;
        }else{
            this.$('.notesPanel').show();
        }

        var $notes = this.$('ul.notes');
        $notes.html('');



        this.collection.each(function(note){

            var noteView = new GameNoteView({model: note});

            $notes.append(noteView.render().el);
        });

    },

    render: function(){

        this.$el.html(this.template());

        return this;

    }

});


var GameNoteView = Backbone.View.extend({

    tagName:"li",
    className: "gameNote",

    initialize: function(){

        this.template = _.template($("#game-note-template").html());

    },

    events: {
        //'dblclick div.noteText': 'editNote',
        'click .deleteNote': 'deleteNote'
    },

    deleteNote: function(){

        var that = this;

        this.model.destroy({wait:true, error: simpleErrorHandler, success: function(){
            that.$el.slideUp(function(){
                that.remove();
            });

        }});

    },

//    editNote: function(){
//        this.$('textarea.editNoteText').val(this.model.get('note'));
//
//        this.$('div.noteText').hide();
//        this.$('textarea.editNoteText').show();
//    },

    render: function(){

        function pad2(number){
            return (number < 10 ? '0' : '') + number;
        }

        var note = this.model.get('note').replace(/\n/g, '<br />');
        var date = new Date(this.model.get('createdAt'));

        date = date.getFullYear() + '-' + pad2(date.getMonth()+1) + '-' + pad2(date.getDate()) + "<br>" + pad2(date.getHours()) + ':' + pad2(date.getMinutes()) + ':' + pad2(date.getSeconds());

        this.$el.html(this.template({note: note, date: date}));

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
        this.collection.bind("change:itemCount",this.renderRemaining,this);

        this.items = [];
    },

    renderItems: function(){

        $(this.el).fadeTo(0,1);

        this.spinner.stop();

        var $items = this.$('.items');

        var collection = this.collection;

        var that = this;

        this.collection.each(function(item){

            var itemView = new ItemView({model: item, collection: collection });

            that.items.push(itemView);

            $items.append(itemView.render().el);
        },this);


        this.renderRemaining();



        $items.hide();
        $items.fadeIn(700);

        return this;

    },


    renderRemaining: function(){

        this.$("h3").html("Remaining: " + this.collection.remaining());

        _.each(this.items, function(itemView){
            itemView.renderPercentage();
        });


        return this;

    },

    renderAsItemList: function(){
        this.$('.items').removeClass('itemTable');

        this.$('.items').addClass('itemList');
    },

    renderAsItemTable: function(){
        this.$('.items').removeClass('itemList');

        this.$('.items').addClass('itemTable');
    },

    renderItemsDisplay: function(asList){

        if(asList){
            this.renderAsItemList();
        }else{
            this.renderAsItemTable();
        }

        _.each(this.items, function(itemView){
            itemView.renderItemsDisplay(asList);
        });

    },

    render: function(){

        $(this.el).html(this.template(this.model.toJSON()));

        $(this.el).fadeTo(0,0.3);

        this.$('.items').append(this.spinner.spin().el);

        if(app.currentPlayer.get('showItemsAsList')){
            this.renderAsItemList();
        }else{
            this.renderAsItemTable();
        }


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

        this.items = [];

    },

    renderItems: function(){

        $(this.el).fadeTo(0,1);

        this.spinner.stop();

        var $items = this.$('.items');

        var collection = this.collection;

        var that = this;

        this.collection.each(function(item){

            var itemView = new ItemView({model: item, collection: collection });

            that.items.push(itemView);

            $items.append(itemView.render().el);

        });

        this.renderRemaining();

        $items.hide();
        $items.fadeIn(700);

        return this;

    },

    renderRemaining: function(){

        this.$("h3").html("Remaining: " + this.collection.remaining());

        _.each(this.items, function(itemView){
            itemView.renderPercentage();
        });

        return this;

    },

    renderAsItemList: function(){
        this.$('.items').removeClass('itemTable');

        this.$('.items').addClass('itemList');
    },

    renderAsItemTable: function(){
        this.$('.items').removeClass('itemList');

        this.$('.items').addClass('itemTable');
    },

    renderItemsDisplay: function(asList){

        if(asList){
            this.renderAsItemList();
        }else{
            this.renderAsItemTable();
        }

        _.each(this.items, function(itemView){
            itemView.renderItemsDisplay(asList);
        });

    },

    render: function(){

        $(this.el).html(this.template(this.model.toJSON()));

        $(this.el).fadeTo(0,0.3);

        this.$('.items').append(this.spinner.spin().el);

        if(app.currentPlayer.get('showItemsAsList')){
            this.renderAsItemList();
        }else{
            this.renderAsItemTable();
        }

        return this;

    }

});


var ItemView = Backbone.View.extend({

    tagName: "li",
    className: "item",

    initialize: function(){

        _.bindAll(this);

        this.spinner = new Spinner(opts_small);

        this.template = _.template($("#item-template").html());

        this.model.bind("sync", this.renderSync, this);

        this.canEdit = true;

    },

    events: {
        'click .itemSub': 'subClick',
        'click .click-to-reset': 'imgClick',
        'click .itemAdd': 'addClick',
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

    subClick: function(){

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

    addClick: function(){

        //only allow one update of item count
        if(!this.canEdit){
            return;
        }

        this.add();

        this.$(".itemImg").fadeTo(0,0.3);

        this.$(".itemCount").addClass('zero');
        //start spinner
        this.$(".itemCount").html(this.spinner.spin().el);

        this.canEdit = false;

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

    renderPercentage: function(){

        var total = this.collection.remaining();
        var itemCount = this.model.get('itemCount');

        var perc = 0;

        if(app.currentPlayer.get('percentageType')==0){

            perc = total>0?(itemCount/total*100).toFixed(1)+'%': '0.0%';

        }else if(app.currentPlayer.get('percentageType')==1){

            if(total > 22){
                total = 22;
            }
            if(itemCount == 0){
                perc =0;
            }
            else if(total - itemCount < 6){
                perc = 1;
            }else{

                //1-FACT($A3-B$2)*FACT($A3-6)/(FACT($A3)*FACT($A3-B$2-6))
                perc = 1 - (factorial(total-itemCount)*factorial(total-6)/(factorial(total)*factorial(total-itemCount-6)));
            }

            perc = perc>0?(perc*100).toFixed(1)+'%': '0.0%';

        }


        this.$(".itemPerc").html(perc);

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

    renderAsItemList: function(){

        this.$('.itemImg').removeClass('itemTable');
        this.$('.click-to-reset').removeClass('itemTable');
        this.$('.itemName').removeClass('itemTable');
        this.$('.itemCount').removeClass('itemTable');
        this.$('.itemPerc').removeClass('itemTable');
        this.$('.itemSub').removeClass('itemTable');
        this.$('.itemAdd').removeClass('itemTable');

        this.$('.itemImg').addClass('itemList');
        this.$('.click-to-reset').addClass('itemList');
        this.$('.itemName').addClass('itemList');
        this.$('.itemCount').addClass('itemList');
        this.$('.itemPerc').addClass('itemList');
        this.$('.itemSub').addClass('itemList');
        this.$('.itemAdd').addClass('itemList');

        this.renderPercentage();

    },

    renderAsItemTable: function(){

        this.$('.itemImg').removeClass('itemList');
        this.$('.click-to-reset').removeClass('itemList');
        this.$('.itemName').removeClass('itemList');
        this.$('.itemCount').removeClass('itemList');
        this.$('.itemPerc').removeClass('itemList');
        this.$('.itemSub').removeClass('itemList');
        this.$('.itemAdd').removeClass('itemList');

        this.$('.itemImg').addClass('itemTable');
        this.$('.click-to-reset').addClass('itemTable');
        this.$('.itemName').addClass('itemTable');
        this.$('.itemCount').addClass('itemTable');
        this.$('.itemPerc').addClass('itemTable');
        this.$('.itemSub').addClass('itemTable');
        this.$('.itemAdd').addClass('itemTable');

    },

    renderItemsDisplay: function(asList){

        if(asList){
            this.renderAsItemList();
        }else{
            this.renderAsItemTable();
        }

    },

    render: function(){

        $(this.el).html(this.template(this.model.formatToJSON()));

        this.renderItemCount();

        this.renderPercentage();

        if(app.currentPlayer.get('showItemsAsList')){
            this.renderAsItemList();
        }else{
            this.renderAsItemTable();
        }


        return this;
    }

});


$(function(){
    var LoginModel = new app.Login();

    app.PlayerView = PlayerView;
    app.EnemiesView = EnemiesView;
    app.EnemyView = EnemyView;
    app.StatisticsView = StatisticsView;
    app.SelectedEnemyView = SelectedEnemyView;
    app.SelectedGameView = new SelectedGameView();
    app.AddGameView = new AddGameView();
    app.AddEnemyView = new AddEnemyView();
    app.SignupView = new SignupView({model: LoginModel});
    app.LoginView = new LoginView({model: LoginModel});
    app.LoggedPlayerView = LoggedPlayerView;
    app.ErrorView = new ErrorView();

});

