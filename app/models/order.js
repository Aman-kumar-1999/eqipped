const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }, 
    vendorStatus: { type: String, default: 'pending'},
    vendorId: { type: Schema.Types.ObjectId, ref: 'User'},
    customerName: { type: String,},
    phone: { type: String},
    email: { type: String},
    address: { type: String},
    pincode: { type: Number},
    orderId: { type: String},
    groupId: { type: String},
    txnDate: { type: String },
    txnAmount: { type: String},
    discountedtotal: { type: Number},
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon'},
    remainingAmount: { type: String, required: false },
    advance: { type: String},
    items: { type: Object },
    // bankName:{ type: String},
    bankTxnId: { type: String},
    gateWayName: { type: String},
    paymentMode:{ type: String},
    respcode: { type: String},
    txnStatus:{ type: String},
    respmsg:{ type: String},
    total: { type: String},
    txnID: { type: String, required: false },
    status: { type: String, default: "order_placed" },  
    createdAt: {
      type: Date,
      default: Date.now,
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
