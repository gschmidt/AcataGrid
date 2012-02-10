// Properties of a cell:
//  - x
//  - y
//  - contents:
//      true for black, false for white, or a string (one character)
//  - comment: string
Cells = Meteor.Collection("cells");

// Properties of a user:
//  - name
//  - color (string - 6 hex digits)
//  - selected_cell (current cursor position)
Users = Meteor.Collection("users");

// XXX separate selected_cell out into a separate session object, so
// users can have multiple cursor positions?

if (Meteor.is_server) {
  Meteor.publish('cells', {});

  Meteor.publish('users', {});

  Meteor.startup(function () {
    if (!Cells.find().count()) {
      console.log("creating data");
      for (var y = 0; y < 10; y++)
        for (var x = 0; x < 10; x++)
          Cells.insert({x: x, y: y, contents: !!((x + y) % 2),
                        comment: "I am the cell at (" + x + ", " + y + ")"});
    }
  });
}
