import mongoose from 'mongoose'

const MongoDB=async()=>{
    try {
        await mongoose.connect("mongodb+srv://aadithyanmerin:AdithyanMerin@cluster0.syz6u.mongodb.net/FridayDb");
        console.log("MongoDB connected successfully")
    } catch (error) {
        console.log("something wrong in server",error)
    }
}
export default MongoDB