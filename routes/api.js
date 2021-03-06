/*
    Author: ZhaoShuai
    Mob: 13683088643
    QQ & WeChat: 1812532016
*/
//API
var express = require('express');

var router = express.Router();

var UserTable = require('../models/User');//引入User

var article = require('../models/article');//引入article;

var responsetext = {};//

router.use(function (req, res, next) {
  
  responsetext = {
    code: 0,
    msg: 'success!'
  };
  
  next();
  
});

//注册:
router.post('/user/register', function (req, res) {
  
  // console.log(req.body);//{username: 'asdsad' , password: '', cpassword: 'sdfsd'};
  
  var username = req.body.username;
  var passwrod = req.body.password;
  var cpassword = req.body.cpassword;
  
  if (username === '') {
    responsetext.code = 1;
    responsetext.msg = '用户名不能为空!';
    res.send(responsetext);
    return;
  }
  
  if (passwrod === '') {
    responsetext.code = 2;
    responsetext.msg = '密码不能为空!';
    res.send(responsetext);
    return;
  }
  
  if (passwrod != cpassword) {
    responsetext.code = 3;
    responsetext.msg = '两次输入的密码不一致!';
    res.send(responsetext);
    return;
  }
  
  UserTable.findOne({//从表格里面进行查询:
    username: username//查询的内容
  }).then(function (info) {//查询之后的操作:
    // console.log('info: ' + info);//info代表查询的信息:
    
    if (info) {//如果info不为null;
      responsetext.code = 4;
      responsetext.msg = '用户名已存在!';
      res.send(responsetext);
      return;
    }
    
    var user = new UserTable({//创建新的用户名
      username: username,
      password: passwrod
    });
    
    return user.save();//提交当前的信息到表格中;
  }).then(function (newInfo) {//提交完成之后的操作:
    // console.log('newInfo: ' + newInfo);//newInfo是提交完成之后的信息:
    responsetext.code = 5;
    responsetext.msg = '注册成功!';
    res.send(responsetext);
    res.end();
  });
  
});

//登录:
router.post('/user/login', function (req, res) {
  
  console.log(req.body);//
  
  var username = req.body.username;
  var password = req.body.password;
  
  if (username === '') {
    responsetext.code = 4;
    responsetext.msg = '用户名不能为空!';
    res.send(responsetext);
    return;
  }
  
  if (password === '') {
    responsetext.code = 5;
    responsetext.msg = '密码不能为空!';
    res.send(responsetext);
    return;
  }
  
  UserTable.findOne({
    username: username
  }).then(function (info) {
    
    if (!info) {
      responsetext.code = 6;
      responsetext.msg = '用户名不存在!';
      res.send(responsetext);
      return;
    }
    
    responsetext.info = {
      name: info.username,
      _id: info._id
    };
    
    req.cookies.set('userInfo', JSON.stringify({
      _id: info._id,
      username: info.username
    }));
    
    res.send(responsetext);
    res.end();
  });
  
  
});

//退出登录:
router.get('/user/logout', function (req, res) {
  req.cookies.set('userInfo', null);
  responsetext.code = 7;
  responsetext.msg = '退出成功!';
  res.send(responsetext);
  res.end();
});

//文章分类查询:
router.get('/article/select', function (req, res) {
  var id = req.query.id;
  var limit = Number(req.query.limit);
  var page = Number(req.query.page) || 1;
  var skip = (page - 1) * limit || 0;
  
  article.count({category: id}).then(function (count) {
    article.where({category: id}).limit(limit).skip(skip).then(function (info) {
      res.send({info: info, count: count});
      res.end();
    })
  });
});

//文章分页:
router.get('/article/page', function (req, res) {
  var page = Number(req.query.page) || 1;
  var id = req.query.id;
  var limit = Number(req.query.limit);
  var skip = (page - 1) * limit;
  
  article.count({category: id}).then(function (count) {
    article.find({category: id}).limit(limit).skip(skip).then(function (info) {
      res.send({info: info, count: count});
      res.end();
    })
  })
});

//提交评论：
router.post('/msg/post', function (req, res, next) {
  
  article.findOne({
    _id: req.body.id
  }).then(function (info) {
    info.comments.push({
      user: req.body.user,
      con: req.body.con,
      times: new Date()
    });
    return info.save();
  }).then(function (newInfo) {
    res.send(newInfo.comments);
    res.end();
  });
});

//获取评论:
router.get('/msg', function(req, res){
  console.log(req.query.id);
  
  article.findOne({
    _id: req.query.id
  }).then(function(info){
    res.send(info.comments);
    res.end();
  })
});

module.exports = router;
