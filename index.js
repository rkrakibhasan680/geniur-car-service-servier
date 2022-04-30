const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app =express();

//middle ware
app.use(cors());
app.use(express.json());

function verifyJWT(req,res,next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message:' unauthorized Access'})
    }
    const token =authHeader.split(' ')[1];
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
        if(err){
            return res.status(403).send({message:"Forbidden access"})
        }
        console.log('decoded',decoded);
        req.decoded=decoded;
        next();
    })
    
}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nunqu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
try{

}finally{
    await client.connect();
    const serviceCollection = client.db('geniusCar').collection('service');
    const orderCollection =client.db('geniusCar').collection('order');
     
// Auth 
app.post('/login',async(req,res)=>{
    const user = req.body;
    const accessToken=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:'1d'
    });
    res.send({accessToken});

})
    // service api 
    app.get('/service',async(req,res)=>{
        const query ={};
    const cursor = serviceCollection.find(query);
    const services = await cursor.toArray();
    res.send(services);
    })

    // find one user information 
    app.get('/service/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id:ObjectId(id)};
        const service = await serviceCollection.findOne(query);
        res.send(service);
    })
//post
app.post('/service',async (req,res)=>{
    const newService =req.body;
    const result=await serviceCollection.insertOne(newService);
    res.send(result);
})

// delete post 
app.delete('/service/:id',async (req,res)=>{
    const id = req.params.id;
    const query = {_id:ObjectId(id)};
    const result =await serviceCollection.deleteOne(query);
    res.send(result)

})

// order collection api 
app.post('/order',async(req,res)=>{
    const order =req.body;
    const result=await orderCollection.insertOne(order);
    res.send(result);
})

// order collection api 
app.get('/order',verifyJWT,async(req,res)=>{
    const decodedEmail =req.decoded.email;
    const email = req.query.email;
    if(email === decodedEmail){
        const query={email:email};
    const cursor = orderCollection.find(query);
    const orders = await  cursor.toArray();
    res.send(orders);
    }
})


}
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('running genious server')
})

app.listen(port,()=>{
    console.log('listening to port',port)
})

