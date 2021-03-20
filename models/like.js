var mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Status = Object.freeze({
  True: true,
  False: false
});
var likeSchema = new mongoose.Schema({
	status: {
        type: String,
        enum: Object.values(Status),
    },
 	post_id: { type: Schema.Types.ObjectId, ref: 'Posts' },
	liked_by: { type: Schema.Types.ObjectId, ref: 'Users' },
    created_at: { type : Date, default: Date.now },
    updated_at: { type : Date, default: Date.now },
    deleted_at: { type : Date, default:null }
});
var Likes = mongoose.model('Likes', likeSchema);
module.exports = Likes;