import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    birthday: {
        type: String,
        required: true
    },
    marital_status: {
        type: String,
        required: true
    }
}, {versionKey: false});

export default mongoose.model('User', userSchema);