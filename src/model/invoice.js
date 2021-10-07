import { Schema, model } from 'mongoose';

const invoiceSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  sum: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: Date,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  image: {
    type: Schema.Types.Buffer,
  },
});

const Invoice = model('Invoice', invoiceSchema, 'invoices');

export default Invoice;
