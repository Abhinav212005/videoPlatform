import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, //one who is subscribing to the plan
        ref: "User",
    },
    channel: {
        type: Schema.Types.ObjectId, //one to whom 'subscriber' is subscribing to, i.e., the channel owner
        ref: "User",
    },
},{timestamps: true});

export const Subscription = mongoose.model("Subscription", subscriptionSchema);