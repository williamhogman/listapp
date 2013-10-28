"use strict"

Parse.initialize("mwxoV6PNxwltxShGIVkyInh7LqpoHh6vvwgmqpFQ", "PaO6aQbp7syOyq0iHlHoiqceMiYWOcT3fbh5qwdB");

var Vote = Parse.Object.extend("Vote");


var VoteListingRow = Parse.View.extend({
  tagName: "tr",
  className: "votelist",
  template: Hogan.compile("<td class='title'>{{name}}</td><td><a class='admin btn btn-default btn-xs' href='/votes/{{& objectId}}/admin'>Woop</a></td>"),

  events: {
    "click .admin": "administer",
    "click .title": "view"
  },

  render: function() {
    this.$el.html(this.template.render(this.model.toJSON()))
    return this;
  },

  administer: function(event){
    router.navigate($(event.target).attr("href"), true);
    event.preventDefault();
  },

  view: function(event){
    router.navigate("/votes/" + this.model.id, true);
    event.preventDefault();
  }
});


var VoteCollection = Parse.Collection.extend({
  model: Vote
});


var Votes = new VoteCollection();

var VoteListing = Parse.View.extend({

  className: "col-xs-12 table table-hover listing",
  tagName: "table",

  initialize: function() {

    Votes.on("add", this.addOne, this);
    Votes.on("reset", this.addAll, this);


    this.footer = this.$("#main");

    Votes.fetch();
  },

  render: function(){
    console.log("render called!");
    this.$el.empty();
    return this;
  },

  addOne: function(vote) {
    console.log("adding!");
    var view = new VoteListingRow({model: vote});
    this.$el.append(view.render().el);
  },

  addAll: function(){
    Votes.each(this.addOne, this);
  }


});


var Tally = Parse.View.extend({
  className: "col-xs-12 col-md-6 col-lg-3",
  template: Hogan.compile("<h2>{{name}}</h2>"),
  initialize: function(options){
    this.name = options.name;
    this.votesCast = options.votesCast;
  },

  render: function(){
    this.$el.html(this.template.render({votes: this.votesCast, name: this.name}));
    return this;
  }
});

var TalliesView = Parse.View.extend({
  className: "tallies row",
  initialize: function(options){
    // store the lists to draw
    this.opts = options.options;
    this.vote = options.vote;
  },

  render: function(){
    var els = _(this.opts).map(function(opt){
      return (new Tally({name: opt})).render().el;
    });

    this.$el.append(els);
    
    return this;
  }
});


var VotePage = Parse.View.extend({
  tagName: "article",
  className: "col-xs-12",
  template: Hogan.compile("<h1>{{name}}</h1><p class='lead'>{{description}}</p>"),

  initialize: function(options){
    new Parse.Query(Vote).get(options.modelId).then(_.bind(this.wasUpdated, this));
  },

  wasUpdated: function(model){
    this.model = model;
    this.tally = new TalliesView({options: model.get("options"), vote: model})
    this.render();
  },

  render: function(){
    this.$el.html(this.template.render(this.model.toJSON()));
    this.$el.append(this.tally.render().el);
    return this;
  }
});

var MainView = Parse.View.extend({
  el: $("#main"),

  setView: function(view){
    this.activeView = view;
    this.render();
  },

  render: function(){
    this.$el.html(this.activeView.el);
  }
});

var MainRouter = Parse.Router.extend({
  routes: {
    "": "voteListing",
    "votes/:id": "viewVote",
    "votes/:id/admin": "adminVote"
  },

  adminVote: function(id) {
    console.log("foobar");
  },

  viewVote: function(id) {
    console.log("foo");
    main.setView(new VotePage({modelId: id}))
  },

  voteListing: function() {
    main.setView(new VoteListing());
  }

});


var router = new MainRouter();

var main = new MainView();

Parse.history.start({pushState: true});
