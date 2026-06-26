const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true
    },

    
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true
    },

    
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  { timestamps: true } 
);



const commentModel = mongoose.model("Comment", commentSchema);

module.exports = commentModel;