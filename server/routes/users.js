let express= require('express')
let router = express.Router()
let mongoose = require('mongoose')
let User = require('../models/users')


router.post('/login',(req,res,next)=>{
  let param = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  }
  console.log(param);
  User.findOne(param,(err,doc)=>{
    if(err){
      res.json({
        status: "1",
        msg: err.message
      })
    }else{
      console.log(doc);
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
  console.log(userId);
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
  console.log(userId);
  console.log(productId);
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

  console.log(userId);
  console.log(productId);
  console.log(productNum);
  console.log(checked);
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
      console.log(req.body.checkAll);
  console.log(checkAll);
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

module.exports = router