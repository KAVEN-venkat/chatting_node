var mongoose = require('mongoose');

var tokenSchema = new mongoose.Schema({
	userId:String,
    token: String,
    issuedAt: String,
    requestOriginIP: String,
    validity: String,
    created_at: { type : Date, default: Date.now },
    updated_at: { type : Date, default: Date.now },
    deleted_at: { type : Date, default:null }

});

var Token = mongoose.model('Token', tokenSchema);
module.exports = Token;