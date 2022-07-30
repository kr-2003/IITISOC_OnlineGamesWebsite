const dab_game_logic = {
  games: {},
  make_move: function (room, lineId, pid) {
    var boxes = this.games[room].boxes;
    var boxesColor = this.games[room].boxesColor;
    var selectedLines = this.games[room].selectedLines;
    var lines = this.games[room].lines;
    var linesColor = this.games[room].linesColor;
    var move_made = false;
    lineId = lineId.replace("line", "");
    if (linesColor[lineId] === 0) {
      let lineTouchBoxArray = lines[lineId];
      lineTouchBoxArray.forEach(function (boxThatTouched, j) {
        boxes[boxThatTouched]++;
        ``;
      });
      linesColor[lineId] = pid;
      move_made = true;
    }
    return move_made;
  },
  checkBoxesColor: function (boxes, boxesColor, pid) {
    for (let i = 0; i < boxes.length; i++) {
      if (boxes[i] === 4) {
        if (boxesColor[i] === 0) boxesColor[i] = pid;
      }
    }
  },
  check_for_win: function (boxesColor, pid) {
    let data = {};
    let cntOne = 0;
    let status;
    for (let i = 1; i < boxesColor.length; i++) {
      if (boxesColor[i] === 1) {
        cntOne++;
      }
    }
    if (cntOne === 6) status = "draw";
    else if (cntOne > 6) status = 1;
    else status = 2;

    return status;
  },
};

export default dab_game_logic;
