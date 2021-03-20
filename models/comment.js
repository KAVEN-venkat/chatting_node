var mongoose = require('mongoose');
const Schema = mongoose.Schema;
var commentSchema = new mongoose.Schema({
    content: String,
    post_id: { type: Schema.Types.ObjectId, ref: 'Posts' },
	commented_by: { type: Schema.Types.ObjectId, ref: 'Users' },
	tagged_user: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
    created_at: { type : Date, default: Date.now },
    updated_at: { type : Date, default: Date.now },
    deleted_at: { type : Date, default:null }
});
var Comments = mongoose.model('Comments', commentSchema);
module.exports = Comments;