const mongoose = require('mongoose')
const products = require('./products')
const DB = require('./models/product')

const uri = "mongodb+srv://aman1727:aman1727@cluster0.asty7.mongodb.net/Cluster0?retryWrites=true&w=majority"
const connectionParams={
    useNewUrlParser: true,
    useUnifiedTopology: true 
}

mongoose.connect(uri, connectionParams)
    .then(()=> {
        console.log('Database Connected ...')
    })
    .catch((err) => {
        console.log('Error occured....')
    })


const saveProduct = async(p) => {
    const pro = new DB(p)
    await pro.save()
}

products.map(p => {
    saveProduct(p)
})
