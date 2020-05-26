const mongoose = require("mongoose");

const locationGridSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
     },
  },
  value: {
    type: Object,
    required: true
  },
  zoom_level: {
    type: Number,
    required: true
  }
});
locationGridSchema.index({'location': '2dsphere'}, {unique:true})
var LocationGridModel = mongoose.model("LocationGrid", locationGridSchema);
var DemoLocationGridModel = mongoose.model("Demo LocationGrid", locationGridSchema);

module.exports = {LocationGrid: LocationGridModel, DemoLocationGrid: DemoLocationGridModel};