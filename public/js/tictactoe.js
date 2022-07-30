var socket = io();

$(function () {
  (player = {}),
    (yc = $(".your_color")),
    (oc = $(".opponent_color")),
    (your_turn = false),
    (url = window.location.href.split("/")),
    (room = url[url.length - 1]);

  var text = {
    yt: "Your turn",
    nyt: "Waiting for opponent.",
    popover_h2: "Waiting for opponent.",
    popover_p: "Give the url to a friend to play a game.",
    popover_h2_win: "You won the game!",
    popover_p_win: "Give the url to a friend to play another game.",
    popover_h2_lose: "You lost the game..",
    popover_p_lose: "Give the url to a friend to play another game.",
    popover_h2_draw: "Its a draw.. BUMMER!",
    popover_p_draw: "Give the Url to a friend to play another game.",
  };

  init();

  socket.on("assign", function (data) {
    player.pid = data.pid;
    player.hash = data.hash;
    if (player.pid == "1") {
      yc.addClass("red");
      oc.addClass("yellow");
      player.color = "red";
      player.oponend = "yellow";
      $(".underlay").removeClass("hidden");
      $(".popover").removeClass("hidden");
    } else {
      $(".status").html(text.nyt);
      yc.addClass("yellow");
      oc.addClass("red");
      oc.addClass("show");
      player.color = "yellow";
      player.oponend = "red";
    }
  });

  socket.on("winner", function (data) {
    oc.removeClass("show");
    yc.removeClass("show");
    change_turn(false);
    for (var i = 0; i < 3; i++) {
      $("#" + reverse(data.winner.winner_coins[i])).addClass("winner_coin");
    }

    if (data.winner.winner == player.pid) {
      $(".popover h2").html(text.popover_h2_win);
      $(".popover p").html(text.popover_p_win);
    } else {
      $(".popover h2").html(text.popover_h2_lose);
      $(".popover p").html(text.popover_p_lose);
    }

    // io.to(socket.room).emit("stop");
    setTimeout(function () {
      $(".underlay").removeClass("hidden");
      $(".popover").removeClass("hidden");
    }, 2000);
  });

  socket.on("draw", function () {
    oc.removeClass("show");
    yc.removeClass("show");
    change_turn(false);
    $(".popover h2").html(text.popover_h2_draw);
    $(".popover p").html(text.popover_p_draw);
    setTimeout(function () {
      $(".underlay").removeClass("hidden");
      $(".popover").removeClass("hidden");
    }, 2000);
  });

  socket.on("start", function (data) {
    change_turn(true);
    yc.addClass("show");
    $(".underlay").addClass("hidden");
    $(".popover").addClass("hidden");
  });

  socket.on("stop", function (data) {
    init();
    reset_board();
  });

  socket.on("move_made", function (data) {
    make_move(data.col, data.row, true);
    change_turn(true);
    yc.addClass("show");
    oc.removeClass("show");
  });

  socket.on("opponent_move", function (data) {
    if (!your_turn) {
      oc.css("left", parseInt(data.col) * 100);
    }
    console.debug(data);
  });

  $(".cols > .col").mouseenter(function () {
    if (your_turn) {
      yc.css("left", $(this).index() * 100);
      socket.emit("my_move", { col: $(this).index() });
    }
  });

  $(".btn").click(function () {
    console.log(your_turn);
    if (your_turn) {
      var col = $(this).attr("id")[2];
      var row = $(this).attr("id")[0];
      make_move(col, row);
      socket.emit("makeMove", {
        col: col,
        row: row,
        hash: player.hash,
      });
      change_turn(false);
      yc.removeClass("show");
      oc.addClass("show");
    }
  });

  function make_move(col, row, other) {
    if (
      !$("#" + row + "-" + col).hasClass("red") &&
      !$("#" + row + "-" + col).hasClass("yellow")
    ) {
      if (!other) other = false;
      var color = other ? player.oponend : player.color;
      $("#" + row + "-" + col).addClass(color);
    }
  }

  function init() {
    socket.emit("joinTicTacToe", { room: room });
    $(".popover input").val(window.location.href);
    $(".popover h2").html(text.popover_h2);
    $(".popover p").html(text.popover_p);
    $(".status").html("");
  }

  function reset_board() {
    $(".btn").removeClass("yellow red winner_coin");
    yc.removeClass("yellow red");
    oc.removeClass("yellow red");
    yc.removeClass("show");
    oc.removeClass("show");
  }

  function reverse(s) {
    return s.split("").reverse().join("");
  }

  function change_turn(yt) {
    if (yt) {
      your_turn = true;
      $(".status").html(text.yt);
    } else {
      your_turn = false;
      $(".status").html(text.nyt);
    }
  }

  $(".popover input").click(function () {
    $(this).select();
  });
});
