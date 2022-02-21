let mongoose =require("mongoose");
let Schema = mongoose.Schema;

let Entrar = new Schema({
//Login y Registro
    correo:String,
    contrasena:String,
    rol:String,
    tipoDocumento:String,
    documento:String,
    fecha:Date,
    satisfactorio:{ 
      type:Boolean,
      default: true
    },
    nuevo:{
      type: Boolean,
      default: true
    },

    //Campos empresa
  NIT:Number,
  nombreEmpresa:String,
  areaDesempena:String,
  telefono:Number,
  direccion:Number,
  repreLegalNom:String,
  comentario:String,
  tac:{
    type: Boolean,
    default:true
  },

  // Campos Usuario 
  nombreusu:String,
  apellidousu:String,
  avatar:String

 
  
    
})
module.exports = mongoose.model("Entradas", Entrar);