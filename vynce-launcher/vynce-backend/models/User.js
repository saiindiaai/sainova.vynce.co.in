import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    vuid: {
      type: Number,
      required: true,
      unique: true,
    },

    username: {
      type: String,
      unique: true,
      sparse: true,
    },

    displayName: {
      type: String,
    },

    age: {
      type: Number,
    },

    parentVUID: {
      type: Number, // for child accounts linking to a parent
      default: null,
    },

    isVerifiedAdult: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);


