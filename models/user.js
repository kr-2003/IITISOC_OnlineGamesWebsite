import mongoose from "mongoose";
const Schema = mongoose.Schema;
import passportLocalMongoose from "passport-local-mongoose";
import findOrCreate from "mongoose-findorcreate";

const userSchema = new Schema({
  email: {
    type: String,
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
  tictactoe: {
    type: Number,
    default: 0,
    required: true,
  },
  connect4: {
    type: Number,
    default: 0,
    required: true,
  },
  dotsandboxes: {
    type: Number,
    default: 0,
    required: true,
  },
  codenames: {
    type: Number,
    default: 0,
    required: true,
  },
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

export const User = mongoose.model("User", userSchema);
