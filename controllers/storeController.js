const mongoose = require('mongoose')
const Store = mongoose.model('Store');

exports.homePage = (req, res) => {
	res.render('index')
}

exports.addStore = (req, res) => {
	res.render('editStore',{title:'Add Store'});
}

exports.createStore = async (req,res)=>{
	const store = await(new Store(req.body)).save();
	req.flash('success',`Successfully created ${store.name}. Care to leave a review?`)
	res.redirect(`/stores/${store.slug}`);
}

exports.getStores =async(req,res)=>{
	const stores = await Store.find();
	res.render('stores',{title: 'Stores',stores })
}

exports.editStore= async(req,res) =>{
	const store = await Store.findOne({_id:req.params.id});
	res.render('editStore',{title: `Edit ${store.name}`,store})
}

exports.updateStore = async (req,res)=>{
	req.body.location.type = 'Point';
	const options = {
		new:true, //return the new store instead of the ol done
		runValidators:true,
	}

	const store = await Store.findOneAndUpdate({_id:req.params.id},req.body,options).exec();
	req.flash('success',`Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}>"View Store!</a>`)
	res.redirect(`/stores/${store._id}/edit`);
}
