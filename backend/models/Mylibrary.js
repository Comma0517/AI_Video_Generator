const mongoose = require('mongoose');

const MylibrarySchema = new mongoose.Schema({
  user_id: {
    type: String,
  },
  title: {
    type: String,
  },
  style: {
    type: {
      topic: String,
      vibe: String,
      video_format: String,
      time: String,
      cta: String
    },
    default: {} 
  },
  images: {
    type: [String], 
    default: [] 
  },
  script: {
    type: [{
      visual: String,
      audio: String,
      status: String
    }],
    default: [] 
  },
  create_date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Mylibrary = mongoose.model('mylibrary', MylibrarySchema);