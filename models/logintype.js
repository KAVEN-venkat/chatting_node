var mongoose = require('mongoose');
const Schema = mongoose.Schema;
var logintypeSchema = new mongoose.Schema({
    name: String,
    alias: String,
    created_at: { type : Date, default: Date.now },
    updated_at: { type : Date, default: Date.now },
    deleted_at: { type : Date, default:null }
});
var Logintypes = mongoose.model('Logintypes', logintypeSchema);
module.exports = Logintypes;