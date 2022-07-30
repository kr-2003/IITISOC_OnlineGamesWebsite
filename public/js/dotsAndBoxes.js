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
    nyt: "Waiting for opponent",
    popover_h2: "Waiting for opponent",
    popover_p: "Give the url to a friend to play a game",
    popover_h2_win: "You won the game!",
    popover_p_win: "Give the url to a friend to play another game",
    popover_h2_lose: "You lost the game..",
    popover_p_lose: "Give the url to a friend to play another game",
    popover_h2_draw: "Its a draw.. bummer!",
    popover_p_draw: "Give the url to a friend to play another game",
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

    if (
      (data.winner === 1 && player.pid === 1) ||
      (data.winner === 2 && player.pid === 2)
    ) {
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
    make_move(data.lineId, true);
    change_turn(true);
    yc.addClass("show");
    oc.removeClass("show");
  });

  socket.on("boxColor", function (data) {
    changeBoxColor(data.boxesColor, true);
  });

  //   socket.on("opponent_move", function (data) {
  //     if (!your_turn) {
  //       oc.css("left", parseInt(data.lineId) * 100);
  //     }
  //     console.debug(data);
  //   });

  //   $(".cols > .col").mouseenter(function () {
  //     if (your_turn) {
  //       yc.css("left", $(this).index() * 100);
  //       socket.emit("my_move", { col: $(this).index() });
  //     }
  //   });

  $(".line-p1").click(function () {
    console.log(your_turn);
    if (your_turn) {
      var lineId = $(this).attr("id");
      if (!$(this).hasClass("red") && !$(this).hasClass("yellow"))
        change_turn(false);
      make_move(lineId);
      socket.emit("makeMove", {
        lineId: lineId,
        hash: player.hash,
      });

      yc.removeClass("show");
      oc.addClass("show");
    }
  });

  function make_move(lineId, other) {
    if (
      !$("#" + lineId).hasClass("red") &&
      !$("#" + lineId).hasClass("yellow")
    ) {
      if (!other) other = false;
      var color = other ? player.oponend : player.color;
      $("#" + lineId).addClass(color);
    }
  }
  function changeBoxColor(boxesColor, other) {
    for (let i = 0; i < boxesColor.length; i++) {
      if (boxesColor[i] === 1) {
        $("#box" + i).addClass("redColor");
      } else if (boxesColor[i] === 2) {
        $("#box" + i).addClass("yellowColor");
      }
    }
  }

  function init() {
    socket.emit("joinDotsAndBoxes", { room: room });
    $(".popover input").val(window.location.href);
    $(".popover h2").html(text.popover_h2);
    $(".popover p").html(text.popover_p);
    $(".status").html("");
  }

  function reset_board() {
    $(".line-p1").removeClass("yellow red");
    $(".box").removeClass("yellowBox redBox");
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
