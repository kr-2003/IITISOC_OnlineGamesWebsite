import mongoose from "mongoose";
const Schema = mongoose.Schema;
import passportLocalMongoose from "passport-local-mongoose";

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  history: [
    {
      type: {
        game: {
          type: String,
        },
        status: {
          type: String,
        },
        winner: {
          type: String,
        },
        loser: {
          type: String,
        },
      },
    },
  ],
  tictactoe: 0,
  connect4: 0,
  dotsandboxes: 0,
  codenames: 0
});

userSchema.plugin(passportLocalMongoose);

export const User = mongoose.model("User", userSchema);
