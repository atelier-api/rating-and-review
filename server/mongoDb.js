const characeristicSchema = new Schema ({
  characteristic_id: Number,
  value: Number
});


const reviewSchema = new Schema ({
  product_id: Number,
  rating: Number,
  summary: String,
  body: String,
  recommend: Boolean,
  name: String,
  email: String,
  photos: Array,
  characteristics: characeristicSchema
});
