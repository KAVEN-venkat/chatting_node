var mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Genders = Object.freeze({
  Male: 'male',
  Female: 'female',
  Other: 'other',
});

var userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    gender: {
        type: String,
        enum: Object.values(Genders),
    },
    dob:{ type : Date },
    address:String,
    city:String,
    state:String,
    country:String,
    mobile:Number,
    email:String,
    password: String,
    profile_image:String,
    role: { type: Schema.Types.ObjectId, ref: 'Roles' },
    login_type:{ type: Schema.Types.ObjectId, ref: 'Logintypes' },
    social_id:String,
    created_at: { type : Date, default: Date.now },
    updated_at: { type : Date, default: Date.now },
    deleted_at: { type : Date, default:null }
});
var User = mongoose.model('Users', userSchema);
module.exports = User;