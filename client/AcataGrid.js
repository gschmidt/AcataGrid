Session.set("selected_cell", null);

Sky.subscribe('cells');

/***** The grid *****/

var select_cell = function (id) {
  Session.set("selected_cell", id);
};

Template.grid.rows = function () {
  var ret = [];
  for (var y = 0; y < 10; y++) {
    var row = [];
    for (var x = 0; x < 10; x++)
      row.push(null);
    ret.push(row);
  }

  _.each(Cells.find(), function (cell) {
    ret[cell.y][cell.x] = cell;
  });

  return ret;
};

Template.cell.selected = function () {
  return Session.equals("selected_cell", this._id) ? "selected" : "";
};

Template.cell.style = function () {
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
        var cell = Cells.find(selected_cell);
        var new_cell = Cells.find({
          x: cell.x + delta[0],
          y: cell.y + delta[1]
        });
        new_cell = new_cell.length ? new_cell[0] : null;
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

Sky.startup(function () {
  $("#main").focus();
});
