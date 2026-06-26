const app=require("./src/index")
const { connectAndConsume } = require("./src/consumer");
const connectDB=require("./src/utils/db")

const PORT = process.env.PORT || 3006;

connectDB();

try{
app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`)
});
}catch(err){
    console.error("error in server connection",err.message)
}

connectAndConsume();

