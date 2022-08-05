import dotenv from "dotenv";
dotenv.config();
import express from "express";
let app = express();
import mongoose from "mongoose";
import path from "path";
const __dirname = path.resolve();
import methodOverride from "method-override";
import session from "express-session";
import MongoStore from "connect-mongo";
import flash from "connect-flash";
import passport from "passport";
import LocalStrategy from "passport-local";
import ejsMate from "ejs-mate";
import { User } from "./models/user.js";
import ExpressError from "./utils/ExpressError.js";
import catchAsync from "./utils/ExpressError.js";
import { Server } from "socket.io";
import nodemailer from "nodemailer";
const PORT = process.env.PORT || 3000;
const server = express()
  .use(app)
  .listen(PORT, () => console.log(`Listening Socket on ${PORT}`));
const io = new Server(server);
import ttt_game_logic from "./gamelogics/ttt_game_logic.js";
import c4_game_logic from "./gamelogics/c4_game_logic.js";
import dab_game_logic from "./gamelogics/dab_game_logic.js";
let gameMap = {};
let userMap = undefined;
const dbUrl = process.env.DB_URL;
import collect from "collect.js";

mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
  })
  .then(() => {
    console.log("Mongo Connection done");
  })
  .catch((err) => {
    console.log("oh no mongo connection error!!!");
    console.log(err);
  });

const secret = process.env.SECRET || "thisshouldbebettersecret";

const store = new MongoStore({
  mongoUrl: dbUrl,
  secret: secret,
  touchAfter: 24 * 3600,
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
  store,
  secret: "thisshouldbebettersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
// app.set('views', './src/views');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
let currentUser;
app.use((req, res, next) => {
  console.log(req.session);
  req.session.returnTo = req.originalUrl;
  res.locals.currentUser = req.user;
  currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});



app.post("/send_mail", catchAsync(async(req, res)=>{
  console.log(req.body);
  var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
  service: 'gmail',
  auth: {
    user: 'mailsender696969@gmail.com',
    pass: 'apgudqrsyfzeaeeh'
  }
});

var mailOptions = {
  from: 'mailsender696969@gmail.com',
  to: 'iitisocDevTeam@gmail.com',
  subject: req.body.subject_for_mail,
  text: `Name- ${req.body.Name}\n Email- ${req.body.email_for_mail}\n Text- ${req.body.text_mail}`
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
  res.redirect("/");
}))

app.get(
  "/",
  catchAsync(async (req, res) => {
    res.render(__dirname + "/views/index.ejs");
  })
);

// io.sockets.on("connection", function (socket) {
//   console.log("lorem ipsum");
//   socket.on("join", function (data) {
//     console.log(data);
//   });
// });

app.get("/contact", catchAsync(async(req, res)=>{
  res.render("contact.ejs")
}))
app.get(
  "/tictactoe",
  catchAsync(async (req, res) => {
    if (req.user !== undefined) {
      res.writeHead(302, {
        Location: "/tictactoe/" + generateHash(6),
      });
      res.end();
    } else {
      req.flash("error", "Need to login/signup first!!");
      res.redirect(`/login`);
    }
  })
);

app.get("/tictactoe/:room([A-Za-z0-9]{6})", function (req, res) {
  if (req.user !== undefined) {
    res.render("tictactoe.ejs");
  } else {
    req.flash("error", "Need to login/signup first!!");
    res.redirect(`/login`);
  }
});

app.get(
  "/connect4",
  catchAsync(async (req, res) => {
    res.writeHead(302, {
      Location: "/connect4/" + generateHash(6),
    });
    res.end();
  })
);

app.get("/connect4/:room([A-Za-z0-9]{6})", function (req, res) {
  if (req.user !== undefined) res.render("connect4.ejs");
  else {
    req.flash("error", "Need to login/signup first!!");
    res.redirect(`/login`);
  }
});

app.get(
  "/dotsAndBoxes",
  catchAsync(async (req, res) => {
    if (req.user !== undefined) {
      res.writeHead(302, {
        Location: "/dotsAndBoxes/" + generateHash(6),
      });
      res.end();
    } else {
      req.flash("error", "Need to login/signup first!!");
      res.redirect(`/login`);
    }
  })
);

app.get("/dotsAndBoxes/:room([A-Za-z0-9]{6})", function (req, res) {
  if (req.user !== undefined) res.render("dotsAndBoxes.ejs");
  else {
    req.flash("error", "Need to login/signup first!!");
    res.redirect(`/login`);
  }
});

app.get(
  "/codenames",
  catchAsync(async (req, res) => {
    res.render("codenames.ejs");
  })
);

function generateHash(length) {
  var haystack =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    output = "";
  for (var i = 0; i < length; i++) {
    output += haystack.charAt(Math.floor(Math.random() * haystack.length));
  }
  return output;
}

app.get(
  "/leaderboard/tictactoe",
  catchAsync(async (req, res) => {
    let leaderboardUsers = collect(
      await User.find({ tictactoe: { $exists: true } })
        .sort({ tictactoe: -1 })
        .limit(10)
    ).toArray();
    res.render("leaderboard/tictactoe.ejs", { leaderboardUsers });
  })
);
app.get(
  "/leaderboard/connect4",
  catchAsync(async (req, res) => {
    let leaderboardUsers = collect(
      await User.find({ connect4: { $exists: true } })
        .sort({ connect4: -1 })
        .limit(10)
    ).toArray();
    res.render("leaderboard/connect4.ejs", { leaderboardUsers });
  })
);
app.get(
  "/leaderboard/dotsandboxes",
  catchAsync(async (req, res) => {
    let leaderboardUsers = collect(
      await User.find({ dotsandboxes: { $exists: true } })
        .sort({ dotsandboxes: -1 })
        .limit(10)
    ).toArray();
    res.render("leaderboard/dotsandboxes.ejs", { leaderboardUsers });
  })
);
app.get(
  "/leaderboard/codenames",
  catchAsync(async (req, res) => {
    let { game } = req.params;
    let leaderboardUsers = collect(
      await User.find({ codenames: { $exists: true } })
        .sort({ codenames: -1 })
        .limit(10)
    ).toArray();
    res.render("leaderboard/codenames.ejs", { game,leaderboardUsers });
  })
);

var rooms = [];

let Rooms = {};

io.sockets.on("connection", function (socket) {
  socket.on("joinTicTacToe", function (data) {
    if (data.room in ttt_game_logic.games) {
      var game = ttt_game_logic.games[data.room];
      if (typeof game.player2 != "undefined") {
        return;
      }
      console.log("player 2 logged on");
      socket.join(data.room);
      rooms.push(data.room);
      socket.room = data.room;
      socket.pid = 2;
      socket.hash = generateHash(8);
      game.player2 = socket;
      game.player2Username = currentUser.username;
      socket.opponent = game.player1;
      game.player1.opponent = socket;
      socket.emit("assign", { pid: socket.pid, hash: socket.hash });
      game.turn = 1;
      socket.broadcast.to(data.room).emit("start");
    } else {
      console.log("player 1 is here");
      if (rooms.indexOf(data.room) <= 0) socket.join(data.room);
      socket.room = data.room;
      socket.pid = 1;
      socket.hash = generateHash(8);
      ttt_game_logic.games[data.room] = {
        player1: socket,
        player1Username: currentUser.username,
        moves: 0,
        board: [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ],
      };
      rooms.push(data.room);
      socket.emit("assign", { pid: socket.pid, hash: socket.hash });
    }

    socket.on("makeMove", function (data) {
      var game = ttt_game_logic.games[socket.room];
      if ((data.hash = socket.hash && game.turn == socket.pid)) {
        var move_made = ttt_game_logic.make_move(
          socket.room,
          data.col,
          data.row,
          socket.pid
        );
        if (move_made) {
          game.moves = parseInt(game.moves) + 1;
          socket.broadcast.to(socket.room).emit("move_made", {
            pid: socket.pid,
            col: data.col,
            row: data.row,
          });
          game.turn = socket.opponent.pid;
          var winner = ttt_game_logic.check_for_win(game.board);
          // console.log(game.username);
          // console.log(game.board);
          if (winner) {
            io.to(socket.room).emit("winner", { winner: winner });
            console.log(winner.winner);
            console.log(game.player1Username);
            console.log(game.player2Username);
            if (winner.winner == 1) {
              history(
                "won",
                "Tic Tac Toe",
                game.player1Username,
                game.player2Username
              );
            } else {
              history(
                "won",
                "Tic Tac Toe",
                game.player2Username,
                game.player1Username
              );
            }

            // io.to(socket.room).emit("stop");

            // socket.send('winner', {winner: winner});
          }
          if (game.moves >= 9 && !winner) {
            io.to(socket.room).emit("draw");
            history(
              "draw",
              "Tic Tac Toe",
              game.player1Username,
              game.player2Username
            );
            // socket.send('draw');
          }
        }
      }
    });

    socket.on("my_move", function (data) {
      socket.broadcast
        .to(socket.room)
        .emit("opponent_move", { col: data.col, row: data.row });
    });

    socket.on("disconnect", function () {
      if (socket.room in ttt_game_logic.games) {
        delete ttt_game_logic.games[socket.room];
        io.to(socket.room).emit("stop");
        // socket.send('stop');
        console.log("room closed: " + socket.room);
      } else {
        console.log("disconnect called but nothing happend");
      }
      // implement remove room
    });
  });

  socket.on("joinConnect4", function (data) {
    if (data.room in c4_game_logic.games) {
      var game = c4_game_logic.games[data.room];
      if (typeof game.player2 != "undefined") {
        return;
      }
      console.log("player 2 logged on");
      socket.join(data.room);
      rooms.push(data.room);
      socket.room = data.room;
      socket.pid = 2;
      socket.hash = generateHash(8);
      game.player2 = socket;
      game.player2Username = currentUser.username;
      socket.opponent = game.player1;
      game.player1.opponent = socket;
      socket.emit("assign", { pid: socket.pid, hash: socket.hash });
      game.turn = 1;
      socket.broadcast.to(data.room).emit("start");
    } else {
      console.log("player 1 is here");
      if (rooms.indexOf(data.room) <= 0) socket.join(data.room);
      socket.room = data.room;
      socket.pid = 1;
      socket.hash = generateHash(8);
      c4_game_logic.games[data.room] = {
        player1: socket,
        player1Username: currentUser.username,
        moves: 0,
        board: [
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
        ],
      };
      rooms.push(data.room);
      socket.emit("assign", { pid: socket.pid, hash: socket.hash });
    }

    socket.on("makeMove", function (data) {
      var game = c4_game_logic.games[socket.room];
      if ((data.hash = socket.hash && game.turn == socket.pid)) {
        var move_made = c4_game_logic.make_move(
          socket.room,
          data.col,
          socket.pid
        );
        if (move_made) {
          game.moves = parseInt(game.moves) + 1;
          socket.broadcast
            .to(socket.room)
            .emit("move_made", { pid: socket.pid, col: data.col });
          game.turn = socket.opponent.pid;
          var winner = c4_game_logic.check_for_win(game.board);
          if (winner) {
            io.to(socket.room).emit("winner", { winner: winner });
            // socket.send("winner", { winner: winner });
            console.log(winner.winner);
            console.log(game.player1Username);
            console.log(game.player2Username);
            if (winner.winner == 1) {
              history(
                "won",
                "Connect 4",
                game.player1Username,
                game.player2Username
              );
            } else {
              history(
                "won",
                "Connect 4",
                game.player2Username,
                game.player1Username
              );
            }
          }
          if (game.moves >= 42) {
            io.to(socket.room).emit("draw");
            history(
              "draw",
              "Connect 4",
              game.player1Username,
              game.player2Username
            );
            // socket.send("draw");
          }
        }
      }
    });

    socket.on("my_move", function (data) {
      socket.broadcast.to(socket.room).emit("opponent_move", { col: data.col });
    });

    socket.on("disconnect", function () {
      if (socket.room in c4_game_logic.games) {
        delete c4_game_logic.games[socket.room];
        io.to(socket.room).emit("stop");
        // socket.send("stop");
        console.log("room closed: " + socket.room);
      } else {
        console.log("disconnect called but nothing happend");
      }
      // implement remove room
    });
  });

  socket.on("joinDotsAndBoxes", function (data) {
    if (data.room in dab_game_logic.games) {
      var game = dab_game_logic.games[data.room];
      if (typeof game.player2 != "undefined") {
        return;
      }
      console.log("player 2 logged on");
      socket.join(data.room);
      rooms.push(data.room);
      socket.room = data.room;
      socket.pid = 2;
      socket.hash = generateHash(8);
      game.player2 = socket;
      game.player2Username = currentUser.username;
      socket.opponent = game.player1;
      game.player1.opponent = socket;
      socket.emit("assign", { pid: socket.pid, hash: socket.hash });
      game.turn = 1;
      socket.broadcast.to(data.room).emit("start");
    } else {
      console.log("player 1 is here");
      if (rooms.indexOf(data.room) <= 0) socket.join(data.room);
      socket.room = data.room;
      socket.pid = 1;
      socket.hash = generateHash(8);
      dab_game_logic.games[data.room] = {
        player1: socket,
        player1Username: currentUser.username,
        moves: 0,
        boxesColor: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        boxes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        lines: [
          ["0"],
          [1],
          [2],
          [3],
          [4],
          [1],
          [1, 2],
          [2, 3],
          [3, 4],
          [4],
          [1, 5],
          [2, 6],
          [3, 7],
          [4, 8],
          [5],
          [5, 6],
          [6, 7],
          [7, 8],
          [8],
          [5, 9],
          [6, 10],
          [7, 11],
          [8, 12],
          [9],
          [9, 10],
          [10, 11],
          [11, 12],
          [12],
          [9],
          [10],
          [11],
          [12],
        ],
        selectedLines: [],
        linesColor: [
          "0",
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
        ],
      };
      rooms.push(data.room);
      socket.emit("assign", { pid: socket.pid, hash: socket.hash });
    }

    socket.on("makeMove", function (data) {
      var game = dab_game_logic.games[socket.room];
      if ((data.hash = socket.hash && game.turn == socket.pid)) {
        var move_made = dab_game_logic.make_move(
          socket.room,
          data.lineId,
          socket.pid
        );
        console.log(move_made);
        if (move_made) {
          game.moves = parseInt(game.moves) + 1;
          socket.broadcast.to(socket.room).emit("move_made", {
            pid: socket.pid,
            lineId: data.lineId,
            boxesColor: game.boxesColor,
          });
          game.turn = socket.opponent.pid;
          // game_logic.checkBoxes(game.boxes, game.selectedLines, game.lines);
          (game.selectedLines = []), console.log(game.boxes);
          dab_game_logic.checkBoxesColor(
            game.boxes,
            game.boxesColor,
            socket.pid
          );
          io.to(socket.room).emit("boxColor", { boxesColor: game.boxesColor });
          console.log(game.boxesColor);

          if (game.moves >= 31) {
            let winner = dab_game_logic.check_for_win(
              game.boxesColor,
              socket.pid
            );
            if (winner === "draw") {
              io.to(socket.room).emit("draw");
              history(
                "draw",
                "Dots and Boxes",
                game.player1Username,
                game.player2Username
              );
            } else {
              io.to(socket.room).emit("winner", { winner: winner });
              if (winner === 1) {
                history(
                  "won",
                  "Dots and Boxes",
                  game.player1Username,
                  game.player2Username
                );
              } else {
                history(
                  "won",
                  "Dots and Boxes",
                  game.player2Username,
                  game.player1Username
                );
              }
            }
          }
          // var winner = game_logic.check_for_win(game.board);
          // console.log(winner);
          // console.log(game.boxes);
          // if (winner) {
          //   io.to(socket.room).emit("winner", { winner: winner });
          //   // io.to(socket.room).emit("stop");

          //   // socket.send('winner', {winner: winner});
          // }
          // if (game.moves >= 9) {
          //   io.to(socket.room).emit("draw");
          //   // socket.send('draw');
          // }
        }
      }
    });

    // socket.on("my_move", function (data) {
    //   socket.broadcast.to(socket.room).emit("opponent_move", { lineId });
    // });

    socket.on("disconnect", function () {
      if (socket.room in dab_game_logic.games) {
        delete dab_game_logic.games[socket.room];
        io.to(socket.room).emit("stop");
        // socket.send('stop');
        console.log("room closed: " + socket.room);
      } else {
        console.log("disconnect called but nothing happend");
      }
      // implement remove room
    });
  });

  socket.on("joinRoom", ({ user, id, pass }) => {
    console.log(`User ${user} wants to join room ${id} with password ${pass}`);
    let roomToJoin = Rooms[id];
    if (user === "" || id === "") {
      socket.emit("error-message", "Please enter a username and room ID.");
    } else if (roomToJoin === undefined) {
      socket.emit("error-message", "Room not found.");
    } else if (roomToJoin.pass !== pass) {
      socket.emit("error-message", "Password incorrect.");
    } else if (
      roomToJoin.sockets.find((userName) => user == userName) !== undefined
    ) {
      socket.emit("error-message", "Username taken.");
    } else {
      socket.join(id);
      socket.to(id).emit("message", "A user has joined the server.");
      console.log(id);
      console.log(`User ${user} has joined room ${id} with password ${pass}`);
      roomToJoin.sockets.push(user);
      console.log(roomToJoin.sockets);
      console.log(roomToJoin);
      console.log("gameMap: ", gameMap[id]);
      socket.emit("joinGame", id, gameMap[id]);
      socket.emit("updateUsers", Rooms[id].sockets);
      socket.to(id).emit("updateUsers", Rooms[id].sockets);
      socket.emit("createUserMap", socket.id, user);
    }
  });

  socket.on("createRoom", ({ user, id, pass }) => {
    if (user === "" || id === "") {
      socket.emit("error-message", "You have left something empty.");
    } else if (rooms[id] !== undefined) {
      socket.emit("error-message", "This room already exists.");
    } else {
      let newRoom = {
        id,
        pass,
        sockets: [],
      };
      Rooms[newRoom.id] = newRoom;
      console.log(`Client ${user} wants to create ${id} with password ${pass}`);
      socket.join(id);
      newRoom.sockets.push(user);
      socket.emit("putInGame", id);
      socket.emit("updateUsers", Rooms[id].sockets);
      socket.emit("createUserMap", socket.id, user);
    }
  });

  socket.on("game", (currentGame, roomID) => {
    gameMap[roomID] = currentGame;
    //socket.emit('addData', currentGame)
    socket.broadcast.to(roomID).emit("addData", currentGame);
  });

  socket.on("gamePieceClick", (gamePieceID, gameRoom, userID) => {
    socket.emit("clickGamePiece", gamePieceID, userID);
    socket.to(gameRoom).emit("clickGamePiece", gamePieceID, userID);
  });

  socket.on("userMap", (roomID, userIDs) => {
    console.log("USERID: ", userIDs);
    console.log("ROOMID: ", roomID);
    if (userMap !== undefined) {
      let newUserMap = { ...userMap, ...userIDs };
      userMap = newUserMap;
    } else {
      userMap = userIDs;
    }
    console.log("userMap: ", userMap);
    socket.emit("updateUserMap", userMap);
    socket.to(roomID).emit("updateUserMap", userMap);
  });

  socket.on("userJoinTeam", (team, userID, roomID) => {
    socket.emit("userJoinTeam", team, userID);
    socket.to(roomID).emit("userJoinTeam", team, userID);
  });

  socket.on("userChangeRole", (user, role, roomID) => {
    console.log(user, role, roomID);
    socket.emit("userRoleChange", user, role);
    socket.to(roomID).emit("userRoleChange", user, role);
  });

  socket.on("endTurn", (roomID) => {
    socket.to(roomID).emit("endTurn");
  });

  socket.on("new-game", function () {
    socket.emit("new-game");
  });
});

const history = async (status, game, winner, loser) => {
  console.log(status, game, winner, loser);
  const player1 = await User.findOne({ username: winner.toString() });
  const player2 = await User.findOne({ username: loser.toString() });
  if (game === "Tic Tac Toe") {
    if (status == "won") {
      await User.findOneAndUpdate(
        { username: player1.username },
        { $inc: { tictactoe: 5 } }
      );
      await User.findOneAndUpdate(
        { username: player2.username },
        { $inc: { tictactoe: -5 } }
      );
    }
  }
  if (game === "Connect 4") {
    if (status === "won") {
      await User.findOneAndUpdate(
        { username: player1.username },
        { $inc: { connect4: 5 } }
      );
      await User.findOneAndUpdate(
        { username: player2.username },
        { $inc: { connect4: -5 } }
      );
    }
  }
  if (game === "Dots and Boxes") {
    if (status === "won") {
      await User.findOneAndUpdate(
        { username: player1.username },
        { $inc: { dotsandboxes: 5 } }
      );
      await User.findOneAndUpdate(
        { username: player2.username },
        { $inc: { dotsandboxes: -5 } }
      );
    }
  }
  if (game === "Codenames") {
    if (status === "won") {
      await User.findOneAndUpdate(
        { username: player1.username },
        { $inc: { codenames: 5 } }
      );
      await User.findOneAndUpdate(
        { username: player2.username },
        { $inc: { codenames: -5 } }
      );
    }
  }

  player1.history.unshift({
    game: game,
    status: status,
    winner: winner,
    loser: loser,
  });
  await player1.save();
  player2.history.unshift({
    game: game,
    status: status,
    winner: winner,
    loser: loser,
  });
  await player2.save();
};

app.get(
  "/users/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    console.log(id);
    const user = await User.findById(id).populate({ path: "followers" });
    console.log(id);
    console.log(user);
    if (!user) {
      req.flash("error", "Cannot find the user!!");
      return res.redirect("/");
    }
    console.log(user);
    console.log(req.user);
    res.render("profile.ejs", { user });
  })
);

app.get(
  "/users/:id/follow",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (req.user && user !== req.user.username) {
      user.followers.push(req.user);
    }
    await user.save();
    req.flash("success", "Added a follower!!!");
    res.redirect(`/users/${id}`);
  })
);

app.get(
  "/users/:id/:followerId/unfollow",
  catchAsync(async (req, res) => {
    const { id, followerId } = req.params;
    await User.findByIdAndUpdate(followerId, { $pull: { followers: id } });
    req.flash("success", "Unfollowed!");
    res.redirect(`/users/${followerId}`);
  })
);

app.get(
  "/register",
  catchAsync(async (req, res) => {
    res.render("register.ejs");
  })
);

app.get(
  "/login",
  catchAsync(async (req, res) => {
    res.render("login.ejs");
  })
);

app.get(
  "/about",
  catchAsync(async (req, res) => {
    res.render("about.ejs");
  })
);

app.get(
  "/logout",
  catchAsync(async (req, res) => {
    req.logout(function (err) {
      if (err) {
        console.log(err);
        return next(err);
      }
      req.flash("success", "Goodbye!!");
      res.redirect("/");
    });
  })
);

app.get(
  "/games",
  catchAsync(async (req, res) => {
    res.render("games.ejs");
  })
);

app.post(
  "/register",
  catchAsync(async (req, res) => {
    try {
      const user = new User({
        email: req.body.email,
        username: req.body.username,
      });
      const newUser = await User.register(user, req.body.password);
      await User.findOneAndUpdate(
        { username: newUser.username },
        { $inc: { tictactoe: 0 } }
      );

      await User.findOneAndUpdate(
        { username: newUser.username },
        { $inc: { connect4: 0 } }
      );
      await User.findOneAndUpdate(
        { username: newUser.username },
        { $inc: { dotsandboxes: 0 } }
      );
      await User.findOneAndUpdate(
        { username: newUser.username },
        { $inc: { codenames: 0 } }
      );
      newUser.save();
      req.login(newUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Successfully signed up!!");
        res.redirect("/");
      });
    } catch (err) {
      // console.log(err.message);
      req.flash("error", "Something went wrong!");
      res.redirect("/register");
    }
  })
);

app.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/",
  }),
  catchAsync(async (req, res) => {
    req.flash("success", "Welcome Back!!!");
    const redirectUrl = req.session.returnTo || "/";
    res.redirect(redirectUrl);
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!!" } = err;
  if (!err.message) err.message = "Something went wrong!!";
  console.log(err.message);
  res.status(statusCode).render("error", { err });
});

// app.listen(3000, function () {
//   console.log("heloe");
// });
