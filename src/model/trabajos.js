let mongoose =require("mongoose");
let Schema = mongoose.Schema;

let Jobs = new Schema({
  //Datos Trabajo
  trabajoNombre: String,
  duracion: String,
  categoria:String,
  descripcion:String,
  email:String
  })
  module.exports = mongoose.model("Trabajos", Jobs);