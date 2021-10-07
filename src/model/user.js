import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  loginName: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = model('User', userSchema, 'users');

export default User;
