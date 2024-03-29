import { IUser } from '@destiny/common/types/IUser';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema<IUser>(
  {
    userName: {
      type: String,
      required: [true, 'A user must have a username'],
    },
    provider: {
      type: String,
      required: [true, 'A user must have a provider'],
    },
    email: {
      type: String,
    },
    picture: {
      type: String,
      required: [true, 'A user must have a profile picture'],
    },
    providerId: {
      type: String,
      required: [true, 'A user must have a provider id'],
    },
    trustPoints: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    numQuestions: {
      type: Number,
      default: 0,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    suspended: {
      type: Boolean,
      default: false,
    },
    suspendedCount: {
      type: Number,
      default: 0,
    },
    banned: {
      type: Boolean,
      default: false,
    },
    onCooldown: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
