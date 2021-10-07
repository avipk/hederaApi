import { Schema, model } from 'mongoose';

const userDetailsSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: String,
  phone: [
    {
      type: { type: String },
      number: String,
    },
  ],
  uid: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  idNumber: String,
});

const UserDetails = model('UserDetails', userDetailsSchema, 'userDetails');

export default UserDetails;
