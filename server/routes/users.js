let express= require('express')
let router = express.Router()
let mongoose = require('mongoose')
let User = require('../models/users')
require('./../util/util')


router.post('/login',(req,res,next)=>{
  let param = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  }
  User.findOne(param,(err,doc)=>{
    if(err){
      res.json({
        status: "1",
        msg: err.message
      })
    }else{
      if(doc){
        res.cookie("userId",doc.userId,{
          path:'/',
          maxAge: 1000*60*60
        })
        res.cookie("userName",doc.userName,{
          path: '/',
          maxAge: 1000*60*60
        })
        // req.session.user = doc;
        res.json({
          status: "0",
          msg: '',
          result: {
            userName: doc.userName
          }
        })
      }
    }
  })
})


//登出接口
router.post('/logout',(req,res,next)=>{
  // let param = {
  //   userName: req.body.userName,

  // }
  // res.cookie("userId","",{
  //   path:'*',
  //   maxAge: -1
  // })
  res.clearCookie('userId');
  res.json({
    status: "0",
    msg: '',
    result: ''
  })
})

router.get("/checkLogin", (req,res,next)=>{
  if(req.cookies.userId){
    res.json({
      status: '0',
      msg: '',
      result: req.cookies.userName || ''
    })
  }else{
    res.json({
      status: '1',
      msg: '未登录',
      result:''
    })
  }
})


//获取当前用户的购物车列表
router.get('/cartList',(req,res,next)=>{
  let userId = req.cookies.userId
  User.findOne({userId: userId},(err,doc)=>{
    if(err){
      res.json({
        status: '1',
        msg: err.message
      })
    }else{
      if(doc){
        res.json({
          status: '0',
          msg: '',
          result:doc.cartList
        })
      }
    }
  })
})


//购物车商品删除
router.post('/cart/del',(req,res,next)=>{
  let userId = req.cookies.userId,productId = req.body.productId;
  User.update({userId:userId},{$pull:{"cartList":{"productId":productId}}},(err,doc)=>{
    if(err){
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    }else{
      res.json({
        status:'0',
        msg:'',
        result:"success"
      })
    }
  })
})


//购物车修改
router.post("/cartEdit",(req,res,next)=>{
  let userId = req.cookies.userId,
       productId = req.body.productId, 
       productNum = req.body.productNum,
       checked = req.body.checked;
  User.update({"userId":userId, "cartList.productId": productId},{
    "cartList.$.productNum": productNum,
    "cartList.$.checked": checked
  },(err,doc)=>{
    if(err){
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    }else{
      res.json({
        status: '0',
        msg:'',
        result: "success"
      })
    }
  })

})

//购物车点击全选反选
router.post('/editCheckAll',(req,res,next)=>{
  let userId = req.cookies.userId,
       checkAll = req.body.checkAll?'1':'0';
  User.findOne({userId:userId},(err,user)=>{
    if(err){
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    }else{
      if(user){
        user.cartList.forEach(item=>{
          item.checked = checkAll
        })
        user.save((err1,doc)=>{
          if(err1){
            res.json({
              status:'1',
              msg: err.message,
              result: ''
            })
          }else{
            res.json({
              status:'0',
              msg: '',
              result: 'success'
            })
          }
        })
      }
    
    }
  })
})

//查询用户地址接口
router.get('/addressList',(req,res,next)=>{
  let userId = req.cookies.userId
  User.findOne({userId: userId},(err,doc)=>{
    if(err){
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    }else{
      res.json({
        status: '0',
        msg: '',
        result: doc.addressList
      })
    }
  })
})


//设置默认地址
router.post("/setDefaultAddress",(req,res,next)=>{
  let userId = req.cookies.userId,
       addressId = req.body.addressId;
  if(!addressId){
    res.json({
      status: '1003',
      msg: 'address is null',
      result: ''
    })
  }else{
    User.findOne({userId:userId},(err,doc)=>{
      if(err){
        res.json({
          status: '1',
          msg: err.message,
          result: ''
        })
      }else{
        let addressList = doc.addressList;
        addressList.map(item=>{
          if(item.addressId == addressId){
            item.isDefault = true
          }else{
            item.isDefault = false
          }
        })
        doc.save((err1,doc1)=>{
          if(err1){
            res.json({
              status: '1',
              msg: err.message,
              result: ''
            })
          }else{
            res.json({
              status: '0',
              msg: '',
              result: 'success'
            })
          }
        })
      }
    })
  }
})

//删除地址接口
router.post("/delAddress",(req,res,next)=>{
  let userId = req.cookies.userId,
        addressId = req.body.addressId;
  User.update({
    userId: userId
  },{
    $pull: {
      "addressList": {
        "addressId": addressId
      }
    }
  },(err,doc)=>{
    if(err){
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    }else{
      res.json({
        status: '0',
        msg: '',
        result: 'success'
      })
    }
  })
})


//确认订单
router.post("/payMent",(req,res,next)=>{
  let userId = req.cookies.userId,
      addressId = req.body.addressId,
      orderTotal = req.body.ordertotal;
  User.findOne({userId:userId},(err,doc)=>{
    if(err){
      res.json({
        status: '1',
        msg:err.message,
        result:''
      })
    }else{
      let address='',
          goodsList=[];
      //获取当前用户得地址信息
      doc.addressList.forEach((item)=>{
        if(addressId.addressId == item.addressId){
          address = item
        }
      })
      
      //获取用户购物车得购买商品
      doc.cartList.map(item=>{
        if(item.checked=="1"){
          goodsList.push(item)
        }
      })

      //生成orderId
      let r1 = Math.floor(Math.random() *10)
      let r2 = Math.floor(Math.random() *10)

      let sysDate= new Date().Format('yyyyMMddhhmmss')
      let createDate = new Date().Format('yyyy-MM-dd hh:mm:ss')
      let platform = '622'
      let orderId = platform + r1 + sysDate + r2

      let order = {
        orderId:orderId,
        orderTotal: orderTotal,
        addressInfo: address,
        goodsList: goodsList,
        orderStatus: '1',
        createDate: createDate
      }
      doc.orderList.push(order)
      doc.save((err1,doc1)=>{
        if(err1){
          res.json({
            status: '1',
            msg:err1.message,
            result:''
          })
        }else{
          res.json({
            status: '0',
            msg:'',
            result: {
              orderId: order.orderId,
              orderTotal: order.orderTotal
            }
          })
        }
      })
    }
  })
})

//根据订单id查询订单
router.get('/orderDetail',(req,res,next)=>{
  let userId = req.cookies.userId,
      orderId = req.param("orderId");
  
  User.findOne({userId:userId},(err,userInfo)=>{
    if(err){
      res.json({
        status: '1',
        msg: err.message,
        result:''
      })
    }else{
      let orderList = userInfo.orderList
      if(orderList.length > 0){
        let orderTotal = 0;
        orderList.map(item=>{
          if(item.orderId == orderId){
            orderTotal = item.orderTotal
          }
        })

        res.json({
          status:'0',
          msg:'',
          result:{
            orderId: orderId,
            orderTotal: orderTotal
          }
        })
      }else{
        res.json({
          status: '120001',
          msg: '无此订单',
          result:''
        })
      }
      
    }
  })
})


//查询购物车商品数量
router.get("/getCartCount",(req,res,next)=>{
  if(req.cookies && req.cookies.userId){
    let userId = req.cookies.userId
    User.findOne({userId:userId},(err,doc)=>{
      if(err){
        res.json({
          status: '1',
          msg: err.message,
          result:''
        })
      }else{
        let cartList = doc.cartList
        let cartCount = 0;
        cartList.map(item=>{
          cartCount += parseInt(item.productNum)
        })
        res.json({
          status: '0',
          msg:'',
          result:cartCount
        })
      }
    })
  }
})

module.exports = router