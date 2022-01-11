const express = require('express')
const app = express()
const mongoose = require('mongoose')
const Product = require('./models/product')

// Mongoose Connection
const uri = "mongodb+srv://aman1727:aman1727@cluster0.asty7.mongodb.net/Cluster0?retryWrites=true&w=majority"
const connectionParams={
    useNewUrlParser: true,
    useUnifiedTopology: true 
}
mongoose.connect(uri,connectionParams)
    .then(()=> {
        app.listen(3001, ()=>{
            console.log('Server Started......')
        })
        console.log('Connected With Database ...')
    })
    .catch(err => {
        console.log(`Error in Connection ....${err}`)
    })
// End Connection


// Middlewares
const notFoundMiddleware = require('./middleware/notFound')
app.use(express.json())


// routes
app.get('/', (req,res) => {
    res.status(200).send('<h1>Store API</h1><a href="/api/v1/products">products route</a>')
})


app.get('/api/v1/products', async (req,res) => {
    const {featured,company,name,sort,select,numericFilters} = req.query
    let queryObject = {}
    
    if(featured){
        queryObject.featured = featured === 'true' ? true:false
    }

    if(company){
        queryObject.company = company
    }
    
    if(name){
        queryObject.name = {$regex: name, $options: 'i'}
    }

    if(numericFilters){
        const operatorMap = {
            '>':'$gt',
            '>=':'$gte',
            '=':'$eq',
            '<':'$lt',
            '<=':'$lte'
        }
        const regEx = /\b(<|>|>=|=|<=)\b/g
        let filters = numericFilters.replace(regEx,(match)=>`-${operatorMap[match]}-`)
        const options = ['price','rating']
        filters = filters.split(',').forEach(item => {
            const [field,operator,value] = item.split('-')
            if(options.includes(field)){
                queryObject[field] = {[operator]:Number(value)}
            }
        })
    }

    let result =  Product.find(queryObject)
    if(sort){
        const sortList = sort.split(',').join(' ');
        result = result.sort(sortList)
    }else{
        result = result.sort('createdAt')
    }
    if(select){
        const selectList = select.split(',').join(' ')
        result = result.select(selectList)
    }

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page-1)*limit

    result = result.skip(skip).limit(limit)

    const products = await result
    res.status(200).send({products, nbHits: products.length})
})

// products route

app.use(notFoundMiddleware)
app.use(async (err, req, res,next) => {
    console.log(err)
    res.status(500).send('Something Went Wrong....')
})
