let express = require('express')
let router = express.Router()
let mongoose = require('mongoose')
let Goods = require('./../models/goods')

/**
 * 连接mongoDB数据库
 */
mongoose.connect('mongodb://47.95.216.215/db_demo')

mongoose.connection.on("connected", ()=>{
  console.log("MongoDB 连接成功");

})

mongoose.connection.on("error", ()=>{
  console.log("MongoDB 连接错误");
})

mongoose.connection.on("disconnected", ()=>{
  console.log("MongoDB 连接中断");
})

//查询商品列表数据
router.get('/list',(req,res,next)=>{
  let page = parseInt(req.param("page"))
  let pageSize = parseInt(req.param("pageSize"))
  let sort = req.param("sort")
  let priceLevel = req.param("priceLevel")
  let skip = (page-1)*pageSize
  let params = {}
  
  let priceGt = '', priceLte = '';
  if(priceLevel == "All"){

  }else{
    switch(priceLevel){
      case '0': priceGt = 0;priceLte=500;break;
      case '1': priceGt = 500;priceLte=1000;break;
      case '2': priceGt = 1000;priceLte=5000;break;
    }
    params = {
      salePrice: {
        $gt: priceGt,
        $lte: priceLte
      }
    }
  }
  

  let goodsmodel = Goods.find(params).skip(skip).limit(pageSize)
  goodsmodel.sort({'salePrice':sort})
  goodsmodel.exec((err,doc)=>{
    if(err){
      res.json({
        status: '1',
        msg: err.message
      })
    }else{
      res.json({
        status:'0',
        msg:'',
        result:{
          count: doc.length,
          list: doc
        }
      })
    }
  })
})


//加入购物车
router.post("/addCart",(req,res,next)=>{
  let userId = "100000077"
  let productId = req.body.productId
  let User = require('../models/users')

  User.findOne({
    userId: userId
  },(err,userDoc)=>{
    if(err){
      res.json({
        status: '1',
        msg:err.message
      })
    }else{
      if(userDoc){
        let goodsItem = '';
        userDoc.cartList.forEach(item=>{
          if(item.productId == productId){
            goodsItem = item;
            item.productNum ++;
          }
        })

        if(goodsItem){
          userDoc.save((err2,doc2)=>{
            if(err2){
              res.json({
                status: '1',
                msg:err2.message
              })
            }else{
              res.json({
                status: '0',
                msg: '',
                result: 'success'
              })
            }
          })
        }else{
          Goods.findOne({productId:productId},(err1,doc)=>{
            if(err1){
              res.json({
                status: '1',
                msg:err1.message
              })
            }else{
              if(doc){
                doc.productNum = 1;
                doc.checked = 1;
                console.log(doc);
                userDoc.cartList.push(doc)
                userDoc.save((err11,res1)=>{
                  if(err11){
                    res.json({
                      status: '1',
                      msg:err11.message
                    })
                  }else{
                    res.json({
                      status:'0',
                      msg: '',
                      result:'success'
                    })
                  }
                })
              }
            }
          })
        }
        
      }
    }
  })
})

module.exports = router