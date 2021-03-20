var mongoose = require('mongoose');
const Schema = mongoose.Schema;
var postSchema = new mongoose.Schema({
    content: String,
    images: [{ type:String }],
    tagged_user: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
	posted_by: { type: Schema.Types.ObjectId, ref: 'Users' },
	commentIds: [{ type: Schema.Types.ObjectId, ref: 'Comments' }],
	likeIds: [{ type: Schema.Types.ObjectId, ref: 'Likes' }],
	view_count:{type:Number, default:0},
	share_count:{type:Number, default:0},
    created_at: { type : Date, default: Date.now },
    updated_at: { type : Date, default: Date.now },
    deleted_at: { type : Date, default:null }
});
var Posts = mongoose.model('Posts', postSchema);
module.exports = Posts;