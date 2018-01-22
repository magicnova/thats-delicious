const mongoose = require('mongoose');
const passport = require('passport');
const crypto = require('crypto');
const promisify = require('es6-promisify');
const User = mongoose.model('User');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'You are now logged in!'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out! 👋');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  // first check if the user is authenticated
  if (req.isAuthenticated()) {
    next(); // carry on! They are logged in!
    return;
  }
  req.flash('error', 'Oops you must be logged in to do that!');
  res.redirect('/login');
};

exports.forgot=async(req,res) =>{
  const user = await User.findOne({email: req.body.email});
  
  if(!user){
    req.flash('error','No account with that email exists');
    return res.redirect('/login');
  }

  user.resetPasswordToken=crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires=Date.now()+3600000;
  await user.save();

  const resestUrl =`http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  req.flash('success',`You have been emailed a password reset link ${resestUrl}`);
  res.redirect('/login');
}

exports.reset= async (req,res)=>{
  const user = await User.findOne({
    resetPasswordToken:req.params.token,
    resetPasswordExpires:{$gt: Date.now()}
  });

  if(!user){
    req.flash('error','Password reset is invalid or has expired');
    return res.redirect('/login');  
  }

  res.render('reset',{title:'Reset your password'});
}

exports.confirmedPasswords = (req,res,next)=>{
  if(req.body.password === req.body['password-confirm']){
    next();
    return;
  }
  req.flash('error','Password do not match!');
  res.redirect('back');
}

exports.updatePassword= async(req,res)=>{
  const user = await User.findOne({resetPasswordToken:req.params.token});

  if(!user){
    req.flash('error','Password reset is invalid or has expired');
    return res.redirect('/login');  
  }

  const setPassword = promisify(user.setPassword,user);
  await setPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const updatedUser = await user.save();
  await req.login(updatedUser);
  req.flash('Success','Your password has been reset');
  res.redirect('/')
}