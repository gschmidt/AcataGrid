// XXX change how we handle selected_cell -- consider it to be
// authoritative, rather than the value in our user record, so we
// don't see ghosting as we move our cursor around. (would love to fix
// this in the framework)

Session.set("current_user", null);
Session.set("selected_cell", null);

Meteor.subscribe('cells');
Meteor.subscribe('users');

/***** Methods *****/

var select_cell = function (id) {
  Session.set("selected_cell", id);
  var current_user = Session.get("current_user");
  if (current_user)
    Users.update(current_user, {$set: {selected_cell: id}});
};

var log_in_user = function (id) {
  var old_user = Session.get("current_user");
  if (old_user)
    Users.update(old_user, {$set: {selected_cell: null}});
  Session.set("selected_cell", null);
  Session.set("current_user", id);
};

var log_out = function () {
  Session.set("current_user", null);
};

/***** The grid *****/

// XXX it'd be better to have the helper functions just emit lists of
// integers, and then invoke the partial with the x,y
// coordinates. that way the outer grid would depend only on the
// dimensions of the grid, and the grid could also be sparse.
Template.grid.rows = function () {
  var ret = [];
  for (var y = 0; y < 10; y++) {
    var row = [];
    for (var x = 0; x < 10; x++)
      row.push(null);
    ret.push(row);
  }

  Cells.find().forEach(function (cell) {
    ret[cell.y][cell.x] = cell;
  });

  return ret;
};

Template.cell.selected = function () {
  return Session.equals("selected_cell", this._id) ? "selected" : "";
};

// It'd be better to render a colored frame around the cell:
// - could render multiple (of different sizes) for multiple users
// - you can still see the color of the cell underneath
Template.cell.style = function () {
  // XXX sort by recency of movement
  var user = Users.findOne({selected_cell: this._id});
  if (user) {
    var color = user.color && ("#" + user.color) || 'blue';
    return 'style="background-color: ' + color + ';"';
  }
  return '';
};

Template.cell.type = function () {
  if (this.contents === true)
    return "black";
  if (this.contents === false)
    return "white";
  return "character";
};

Template.cell.text = function () {
  if (this.contents === true || this.contents === false)
    return "";
  return this.contents || '';
};

Template.cell.events = {
  'click': function () {
    select_cell(this._id);
  }
};

Template.main.events = {
  'keydown': function (event) {
    var selected_cell = Session.get("selected_cell");
    if (selected_cell) {
      var delta;
      if (event.which == 37) delta = [-1, 0];
      if (event.which == 38) delta = [0, -1];
      if (event.which == 39) delta = [1, -0];
      if (event.which == 40) delta = [0, 1];

      if (delta) {
        var cell = Cells.findOne(selected_cell);
        var new_cell = Cells.findOne({
          x: cell.x + delta[0],
          y: cell.y + delta[1]
        });
        if (new_cell)
          select_cell(new_cell._id);
        event.preventDefault();
      }

      var contents_keys = {
        32: false, // space,
        27: true, // esc
        8: ' ', // delete and/or backspace
        46: ' ' // ditto
      };
      if (event.which in contents_keys) {
        Cells.update(selected_cell,
                     {$set: {contents: contents_keys[event.which]}})
        event.preventDefault();
      }
    }
  },
  'keypress': function (event) {
    var selected_cell = Session.get("selected_cell");
    if (selected_cell) {
      var character = String.fromCharCode(event.which);
      Cells.update(selected_cell, {$set: {contents: character}});
    }
  }
};

Meteor.startup(function () {
  $("#main").focus();
});

/***** Users *****/

Template.login_bar.current_user = function () {
  return Users.findOne(Session.get("current_user"));
};

Template.login_bar.users = function () {
  return Users.find();
};

Template.login_bar.logged_in = function () {
  return !Session.equals("current_user", null);
};

Template.login_bar.events = {
  'click .edit_user': function () {
    Session.set("edit_user_mode", true);
  },
  'click .log_out': function () {
    log_out();
  },
  'click .create_user': function () {
    Session.set("create_user_mode", true);
  }
};

Template.user.events = {
  'click': function () {
    log_in_user(this._id);
  }
};


/***** Edit my detail *****/

Session.set("edit_user_mode", false);
Template.edit_user.active = function () {
  return Session.get("edit_user_mode");
};

Template.edit_user.user = function () {
  return Users.findOne(Session.get("current_user"));
};

Template.edit_user.events = {
  'click .close': function () {
    var current_user = Session.get("current_user");
    if (current_user)
      // XXX super lame way of finding the <input>
      Users.update(current_user, {$set: {color: $("#edit_user_color").val()}});
    Session.set("edit_user_mode", false);
  }
};

/***** Create user *****/

Session.set("create_user_mode", false);

Template.create_user.active = function () {
  return Session.get("create_user_mode");
};

Template.create_user.events = {
  'click .cancel': function () {
    Session.set("create_user_mode", false);
  },
  'click .save': function () {
    // XXX validation
    var u = Users.insert({name: $("#new_user_name").val()});
    log_in_user(u._id);
    Session.set("create_user_mode", false);
  }
};
