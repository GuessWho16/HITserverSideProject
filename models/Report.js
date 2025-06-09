import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    userid: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    month: {
        type: Number,
        required: true
    },
    costs: {
        type: Array,
        required: true
    }
}, { versionKey: false });

export default mongoose.model('Report', reportSchema);