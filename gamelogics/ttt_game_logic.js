const ttt_game_logic = {
  games: {},
  make_move: function (room, col, row, pid) {
    var board = this.games[room].board;
    var move_made = false;
    if (board[col][row] === 0) {
      board[col][row] = pid;
      move_made = true;
    }
    return move_made;
  },
  check_for_win: function (board) {
    var found = 0,
      winner_coins = [],
      winner = false,
      data = {},
      person = 0;
    //horizontal
    for (let row = 0; row < 3; row++) {
      var selected = board[row][0];
      person = selected;
      if (selected !== 0) {
        if (selected === board[row][1] && selected === board[row][2]) {
          winner = person;
          winner_coins = [row + "-" + 0, row + "-" + 1, row + "-" + 2];
          break;
        }
      }
    }
    //vertical
    if (!winner) {
      for (let col = 0; col < 3; col++) {
        var selected = board[0][col];
        person = selected;
        if (selected !== 0) {
          if (selected === board[1][col] && selected === board[2][col]) {
            winner = person;
            winner_coins = [0 + "-" + col, 1 + "-" + col, 2 + "-" + col];
            break;
          }
        }
      }
    }
    //diagonal
    if (!winner) {
      var selected = board[0][0];
      person = selected;
      if (selected !== 0) {
        if (selected === board[1][1] && selected === board[2][2]) {
          winner = person;
          winner_coins = ["0-0", "1-1", "2-2"];
        }
      }
    }
    if (!winner) {
      var selected = board[0][2];
      person = selected;
      if (selected !== 0) {
        if (selected === board[1][1] && selected === board[2][0]) {
          winner = person;
          winner_coins = ["0-2", "1-1", "2-0"];
        }
      }
    }
    if (winner) {
      data.winner = winner;
      data.winner_coins = winner_coins;
      return data;
    }
    return false;
  },
};

export default ttt_game_logic;
