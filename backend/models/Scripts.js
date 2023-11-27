const mongoose = require('mongoose');

const ScriptSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  topic: {
    type: String,
  },
  vibe: {
    type: String,
  },
  video_format: {
    type: String
  },
  script: {
    type: String
  },
  time: {
    type: String
  },
  cta: {
    type: String
  },
  user: {
    type: String
  },
  create_date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Script = mongoose.model('script', ScriptSchema);