exports.search = function(req, res, app, type, number) {

    var collection = app.db.collection('user');
    
    var query={};
    number = parseInt(number);
    
    if(type==='public'){
        if(number===1){
            query={"pictures.public.1.toValidate":1};
        } else if(number===2){
            query={"pictures.public.2.toValidate":1};
        }else if(number===3){
            query={"pictures.public.3.toValidate":1};
        }
    } else {
        if(number===1){
            query={"pictures.private.1.toValidate":1};
        } else if(number===2){
            query={"pictures.private.2.toValidate":1};
        }else if(number===3){
            query={"pictures.private.3.toValidate":1};
        }
    }    
    
    //console.dir(query);
    collection.find(query).sort({date_update: 1}).toArray(function(err, results) {        
            res.render('admin/masterpage_admin.twig', {
                template: "admin/moderate/search-results.twig",
                admin: req.session.admin,                
                result: results
            });       
    });
};