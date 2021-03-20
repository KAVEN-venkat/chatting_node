var mongoose = require('mongoose');
const Schema = mongoose.Schema;
var roleSchema = new mongoose.Schema({
    name: String,
    alias: String,
    created_at: { type : Date, default: Date.now },
    updated_at: { type : Date, default: Date.now },
    deleted_at: { type : Date, default:null }
});
var Roles = mongoose.model('Roles', roleSchema);
module.exports = Roles;