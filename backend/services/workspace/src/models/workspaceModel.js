const mongoose=require("mongoose");


const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member",
    },
  },
  { _id: false } // no separate _id for subdocuments
);
 
const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Workspace name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: ""
    },
    members: [memberSchema],

    inviteCode: {
     type: String,
    unique: true,
    sparse: true,
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Workspace", workspaceSchema);