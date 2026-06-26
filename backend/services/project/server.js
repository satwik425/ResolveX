const app=require("./src/index")
const connectDB=require("./src/utils/db");
const PORT = process.env.PORT || 3003;
connectDB();

try{
app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`)
});
}catch(err){
    console.error("error in server connection",err.message)
}



