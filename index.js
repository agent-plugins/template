const express = require('express')
const axios = require('axios').default
const app = express()
const port = 3000

// The ability to parse JSON in the body
app.use(express.json())

// This is just the classic example
app.get('/api/', (req, res) => {
    res.send("Hi!")
})

// In OnDemand, use the actual OpenAPI schema, then add a secret "serverurl"
// then set the type to Query
// Set the value to the real server URL
app.use("*", (req, res, next)=>{
    if (req.query["serverurl"] == undefined) return next()
    
    let intendedQuery = Object.assign({}, req.query)
    let intendedHeaders = Object.assign({}, req.headers)

    delete intendedHeaders["host"]
    delete intendedQuery["serverurl"]

    // Create target URL
    let baseURL = req.query["serverurl"]+req.baseUrl + req.path


    // Create the actual intended query
    Object.keys(intendedQuery).forEach((key, index)=>{
        baseURL += (index == 0 ? "?" : "&") + key + "=" + encodeURIComponent(intendedQuery[key])
    })
    

    let config = {
        method:req.method.toLowerCase(),
        url: baseURL,
        headers:intendedHeaders
    }
    if (req.body != undefined && (req.method == "POST" || req.method == "PUT")) config["data"] = req.body


    // Run any pre-processing you need to do here (oauth handlers, external APIs, etc)
    // ...

    try{
        axios(config).then((value)=>{
            res.set(value.headers)
            res.status(value.status).send(value.data)
        })
    } catch (e){res.send(e)}
})
    
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})