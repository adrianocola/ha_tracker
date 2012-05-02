app = window.app ? window.app : {};


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
        this.collection.each(function(enemy) {
            var view = new EnemyView({ model: enemy});
            $enemies.append(view.render().el);
        });

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
        'keypress #add-enemy-name': 'confirmAddEnemy'
    },

    confirmAddEnemy: function(evt){

        if(evt.type === "keypress"){
            if(evt.keyCode == 13){
                this.enemies.create({name: this.$("#add-enemy-name").val()},{at:0, wait:true});
            }
        }else if(evt.type === "click"){
            this.enemies.create({name: this.$("#add-enemy-name").val()},{at:0, wait:true});
        }


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

        console.log();

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

        this.collection.bind("reset",this.renderItems,this);
    },

    renderItems: function(){

        var $items = this.$('.items');

        this.collection.each(function(item){

            $items.append(new ItemView({model: item}).render().el);
        });

        $items.hide();
        $items.fadeIn(700);

        return this;

    },

    render: function(){


        $(this.el).html(this.template(this.model.toJSON()));



        return this;

    }


});

var EnemyItemsView = Backbone.View.extend({

    className: "enemy-items",

    initialize: function(){

        this.template = _.template($("#enemy-items-template").html())

        _.bindAll(this);

        this.collection.bind("reset",this.renderItems,this);

    },

    renderItems: function(){

        var $items = this.$('.items');

        this.collection.each(function(item){

            $items.append(new ItemView({model: item}).render().el);
        });

        $items.hide();
        $items.fadeIn(700);

        return this;

    },

    render: function(){

        $(this.el).html(this.template(this.model.toJSON()));

        return this;

    }

});


var ItemView = Backbone.View.extend({

    tagName: "li",
    className: "item",

    initialize: function(){

        _.bindAll(this);

        this.template = _.template($("#item-template").html())

        this.model.bind("change:itemCount",this.renderItemCount, this);

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

        var that = this;

        //blink effect
        this.$(".itemCount").fadeOut(100, function(){
            that.sub();
            that.$(".itemCount").fadeIn(100);
        });

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
            this.$(".itemImg").fadeTo(400,0.5);
        }else{
            this.$(".itemCount").removeClass('zero');
            this.$(".itemImg").fadeTo(400,1);
        }

        return this;

    },

    render: function(){

        console.log("RENDER");

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


});

