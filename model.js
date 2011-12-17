// Properties of a cell:
//  - x
//  - y
//  - contents:
//      true for black, false for white, or a string (one character)
//  - comment: string
Cells = Sky.Collection("cells");

if (Sky.is_server) {
  Sky.publish('cells', {});

  Sky.startup(function () {
    if (!Cells.find().length) {
      for (var y = 0; y < 10; y++)
        for (var x = 0; x < 10; x++)
          Cells.insert({x: x, y: y, contents: !!((x + y) % 2),
                        comment: "I am the cell at (" + x + ", " + y + ")"});
    }
  });
}
