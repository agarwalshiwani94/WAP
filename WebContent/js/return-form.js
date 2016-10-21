var pId = parseInt($.url().param('pId'));
var id = parseInt($.url().param('id'));

var warehouses = alasql('SELECT * FROM whouse');
for (var i = 0; i < warehouses.length; i++) {
	var $warehouse = warehouses[i];
	var shipTo = $('#shipping select optgroup')[0];
	$('<option>').attr('value', $warehouse.id).attr('data-tokens', $warehouse.name).text($warehouse.name).appendTo(shipTo);
}
$('.selectpicker').selectpicker('refresh')


//populate status select
var order_statuses = DB.choices("RETURN_STATUS");
$.each(order_statuses,function(index,value){
	$('<option>').attr('value', value.id).attr('data-tokens', value.text).text(value.text).appendTo($('#roStatus select'));
})
$('.selectpicker').selectpicker('refresh')


//select for suppliers
var suppliers = alasql('SELECT DISTINCT supplier FROM contracts');
for (var i = 0; i < suppliers.length; i++) {
	var $supplier = suppliers[i];
	$supplier = alasql('SELECT * FROM suppliers where id=?', [$supplier.supplier])[0];
	$('<option>').attr('value', $supplier.id).attr('data-tokens', $supplier.name).text($supplier.name).appendTo($('#suppliers select'));
}
$('.selectpicker').selectpicker('refresh')

if(id){
	$(".returnNum")[0].textContent = "RO" + id;
	$(".returnNum")[1].textContent = $(".returnNum")[1].textContent + "RO" + id;
	var ro = alasql("select * from return_orders where id=?",[id])[0];
	$("#roStatus select").val(ro.status);
	$("#roStatus select").prop("disabled",true)	
	$('.selectpicker').selectpicker('refresh')
	var temp = $("#roStatus select");
	if(DB.choice(ro.status)=="Dispatched"){
		$("#pOrderDate input").val(ro.orderD);
		$("#pReceivedDate input").prop("disabled",true)	
		$(".dispatchB").addClass("hidden")
	}
	else if(DB.choice(ro.status)=="Received"){
		$("#pOrderDate input").val(ro.orderD);			
		$("#pReceivedDate input").val(ro.receivedD);
		$(".dispatchB").addClass("hidden")
	}else{
		$("#pOrderDate input").prop("disabled",true)
		$("#pReceivedDate input").prop("disabled",true)	
	}
	
}
else{
	var orderId = alasql('SELECT MAX(id) as id FROM return_orders')[0]
	if(orderId.id==undefined)
		orderId = 1;
	else
		orderId = orderId.id + 1;
	$(".returnNum")[0].textContent = "RO" + orderId;
	$(".returnNum")[1].textContent = $(".returnNum")[1].textContent + "RO" + orderId;
	
	var statusChoice = DB.choices("RETURN_STATUS");
	var status = "";
	$.each(statusChoice,function(index1,value1){
		if(value1.text=="In Draft")
			status = value1.id;
	})
	$("#roStatus select").val(status);
	$("#roStatus select").prop("disabled",true)
	$("#pReceivedDate input").prop("disabled",true)
	$("#pOrderDate input").prop("disabled",true)
	
}

if(pId){
	
	var link = "purchase.html?id=" + pId;
	$("#linkToP").append("<a href='" + link + "'>P" + pId + "</a>")
	
	//ID,NUMBER,CONTRACT,ORDER_DATE,STATUS,SUPPLIER,S_ADDRESS,S_PHONE,SHIPPING,SH_ADDRESS,SH_PHONE,BILLING,B_ADDRESS,B_PHONE
	var order = alasql('SELECT * FROM purchase_orders where id=?', [pId])[0];
	var contract = alasql('SELECT * FROM contracts WHERE id=?', [parseInt(order.contract)])[0]
	var supplier = alasql('SELECT * FROM suppliers where id=?', [parseInt(contract.supplier)])[0];
	
	if(id){
		var rOrder = alasql('SELECT * FROM return_orders where id=?', [id])[0];
		$("#suppliers select").val(supplier.id);
		$("#suppliers select").prop("disabled",true);
		var address = rOrder.s_address
		address = address.split("<br>").join("\n")
		$("#s_address textarea").val(address);
		$("#s_phone input").val(rOrder.s_phone);
		$("#shipping select").val(rOrder.shipping);
		address = rOrder.sh_address
		address = address.split("<br>").join("\n")
		$("#sh_address textarea").val(address)
		$("#sh_phone input").val(rOrder.sh_phone);
		$("#billing input").val(order.billing);
		$("#billing input").prop("disabled",true)
		$("#b_address textarea").val(rOrder.b_address);
		$("#b_address textarea").prop("disabled",true)
		$("#b_phone input").val(rOrder.b_phone);
		$("#b_phone input").prop("disabled",true)
		$("#pId input").val(rOrder.number);
		$("#pId input").prop("disabled",true)
		var warehouse = alasql('SELECT * FROM whouse where name=?',[order.shipping])[0];
		$("#shipping select").val(warehouse.id);
		$("#shipping select").prop("diabled",true);		
		$("#supplier_ref").val(rOrder.supplier_ref);
	}
	else{
		$("#suppliers select").val(supplier.id);
		$("#suppliers select").prop("disabled",true);
		var address = order.s_address
		address = address.split("<br>").join("\n")
		$("#s_address textarea").val(address);
		$("#s_phone input").val(order.s_phone);
		$("#shipping select").val(order.shipping);
		address = order.sh_address
		address = address.split("<br>").join("\n")
		$("#sh_address textarea").val(address)
		$("#sh_phone input").val(order.sh_phone);
		$("#billing input").val(order.billing);
		$("#billing input").prop("disabled",true)
		$("#b_address textarea").val(order.b_address);
		$("#b_address textarea").prop("disabled",true)
		$("#b_phone input").val(order.b_phone);
		$("#b_phone input").prop("disabled",true)
		$("#pId input").val(order.number);
		$("#pId input").prop("disabled",true)
		var warehouse = alasql('SELECT * FROM whouse where name=?',[order.shipping])[0];
		$("#shipping select").val(warehouse.id);
		$("#shipping select").prop("diabled",true);
	}
	
	//return item list
	var items = alasql('SELECT * FROM po_products where porder=?',[pId]);
	$.each(items,function(index,value){
		if(((value.damaged - value.returned) > 0) || (id)){
			var item = alasql('select * from item where id=?',[parseInt(value.item)])[0];
			var cart = $("#tbody-cart");
			var tr = $("<tr id=" + item.id + ">");
			var index = $("tbody-cart > tr").length;
			tr.append("<td>" + (index+1) + "</td>");
			var kind = alasql("SELECT * FROM kind where id=?", [parseInt(item.kind)])[0]
			kind = kind.text;
			var price = alasql("SELECT * from contract_products where contract=? and product=?", [contract.id,parseInt(item.id)])[0].price;
			var totalP = parseFloat(price) * parseInt(value.qty);
			tr.append("<td>" + kind + "</td>");
			tr.append("<td>" + item.code + "</td>");
			tr.append("<td>" + price + "</td>");
			tr.append("<td>" + value.qty + "</td>");
			tr.append("<td>" + value.damaged + "</td>")
			tr.append("<td>" + value.returned + "</td>")
			var toReturn = (value.damaged - value.returned)
			if(id){
				var rProduct = alasql('SELECT * FROM ro_products where item=? and rorder=?', [item.id,id]);
				if(rProduct.length>0){
					rProduct=rProduct[0]
					toReturn = rProduct.qty;
					var input = $('<input type="number" class="verySm" min="0"></input>')
					input.val(toReturn)
					var cell = $("<td>");
					cell.append(input);
					tr.append(cell)
					var input2 = $("<textarea class='form-control'></textarea>")
					input2.append(rProduct.comment)
					var cell2 = $('<td>');
					cell2.append(input2);
					tr.append(cell2)
					var input3 = $("<input type='checkbox' class='returnChk'>")
					if(rProduct.r_tick==1)
						input3[0].checked = true;
					var cell3 = $('<td>');
					cell3.append(input3);
					tr.append(cell3)
					tr.appendTo(cart);
				}
				else{
					if(value.damaged - value.returned > 0){
						var input = $('<input type="number" class="verySm" min="0"></input>')
						input.val(toReturn)
						var cell = $("<td>");
						cell.append(input);
						tr.append(cell)
						var input2 = $("<textarea class='form-control'></textarea>")
						var cell2 = $('<td>');
						cell2.append(input2);
						tr.append(cell2)
						var input3 = $("<input type='checkbox' class='returnChk'>")
						var cell3 = $('<td>');
						cell3.append(input3);
						tr.append(cell3)
						tr.appendTo(cart);
					}
				}
			}
			else{
				var input = $('<input type="number" class="verySm" min="0"></input>')
				input.val(toReturn)
				var cell = $("<td>");
				cell.append(input);
				tr.append(cell)
				var input2 = $("<textarea class='form-control'></textarea>")
				var cell2 = $('<td>');
				cell2.append(input2);
				tr.append(cell2)
				var input3 = $("<input type='checkbox' class='returnChk'>")
				var cell3 = $('<td>');
				cell3.append(input3);
				tr.append(cell3)
				tr.appendTo(cart);
			}
		}
	})

}

$(".saveB").click(function(){
	var supplier = parseInt($("#suppliers select").val());
	var s_address = $("#s_address textarea").val();
	var s_phone = $("#s_phone input").val();
	var shipping = $("#shipping select").find("option:selected");
	shipping = $("#shipping select")
	shipping = shipping.find("option:selected")
	shipping = shipping[0].textContent;
	var sh_address = $("#sh_address textarea").val();
	var sh_phone = $("#sh_phone input").val();
	var billing = $("#billing input").val();
	var b_address = $("#b_address textarea").val();
	var b_phone = $("#b_phone input").val();
	var temp = $("#roStatus select");
	temp = $("#roStatus select").val()
	var order_status = parseInt($("#roStatus select").val());
	var supplier_ref = $("#supplierRef input").val(); 
	var order_date = ""
	var order_received = ""
	var reorderId = "";
	
	if(id){
		reorderId = id;
		var result = alasql('UPDATE return_orders SET\
							pOrder =?,\
							supplier =?, \
							s_address =?, \
							s_phone =?, \
							shipping =?, \
							sh_address=?, \
							sh_phone=?, \
							billing =?, \
							b_address =?, \
							b_phone =?, \
							supplier_ref =?, \
							receivedD =?, \
							status =? \
							WHERE id=?',[(pId),supplier,s_address,s_phone,shipping,sh_address,sh_phone,billing ,b_address,b_phone,supplier_ref,order_received,order_status,id]);
		var rows = $("#tbody-cart").find("tr");
		$.each(rows,function(index,value){
			if(index>0){
				var row = value;
				var item = row.id;
				var qty = parseInt($(row.children[7]).find("input").val())
				var comment = $(row.children[8]).find("textarea").val()
				var check = row.children[8];
				var roP = alasql('SELECT * FROM ro_products where rorder=? and item=?',[id,parseInt(row.id)]);
				if(roP.length>0){
					roP = roP[0];
					var checkB = $(row.children[9]).find("input")[0];
					if(checkB.checked==true){
						alasql(
							'UPDATE ro_products SET qty=?,comment=?,r_tick=?\
							 where id=?',[qty,comment,1,roP.id])
					}
					else{
						alasql(
								'UPDATE ro_products SET qty=?,comment=?,r_tick=?\
								 where id=?',[qty,comment,0,roP.id])
					}
				}
				else{
					var prodId = alasql('SELECT MAX(id) + 1 as id FROM ro_products')[0]
					if(prodId.id==undefined)
						prodId = 1;
					else
						prodId = prodId.id;
					var checkB = $(row.children[9]).find("input")[0];
					if(checkB.checked==true){
						alasql(
								'INSERT INTO ro_products (id,rorder,item,qty,comment,r_tick)\
								VALUES(?,?,?,?,?,?)',[prodId,orderId,parseInt(row.id),qty,comment,1])
					}
					else{
						alasql(
							'INSERT INTO ro_products (id,rorder,item,qty,comment,r_tick)\
							VALUES(?,?,?,?,?,?)',[prodId,orderId,parseInt(row.id),qty,comment,0])	
					}
				}
			}
		});
		
		window.location = "purchase.html?id=" + pId;
	}
	else{
		var orderId = alasql('SELECT MAX(id) as id FROM return_orders')[0]
		if(orderId.id==undefined)
			orderId = 1;
		else
			orderId = orderId.id + 1;
		reorderId = orderId;
		//ID,NUMBER,pOrder,ORDER_DATE,STATUS,SUPPLIER,S_ADDRESS,S_PHONE,SHIPPING,SH_ADDRESS,SH_PHONE,BILLING,B_ADDRESS,B_PHONE,SUPPLIER_REF,RECEIVED_DATE
		var returnNum = ("RO"+orderId); 
		var result = alasql('INSERT INTO return_orders \
				(id,number,pOrder,supplier,s_address,s_phone,shipping,sh_address,sh_phone,billing,b_address,b_phone,supplier_ref,receivedD,status)\
				VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[orderId,returnNum,(pId),supplier,s_address,s_phone,shipping,sh_address,sh_phone,billing ,b_address,b_phone,supplier_ref,order_received,order_status]);
		var blah = alasql('select * from return_orders where id=?',[orderId])[0];
		var rows = $("#tbody-cart").find("tr");
		$.each(rows,function(index,value){
			if(index>0){
				var row = value;
				var item = row.id;
				var qty = parseInt($(row.children[7]).find("input").val())
				var comment = $(row.children[8]).find("textarea").val()
				var check = row.children[8];
				if(row.children[8]){}
				var prodId = alasql('SELECT MAX(id) + 1 as id FROM ro_products')[0]
				if(prodId.id==undefined)
					prodId = 1;
				else
					prodId = prodId.id;
				var checkB = $(row.children[9]).find("input")[0];
				if(checkB.checked==true){
					alasql(
						'INSERT INTO ro_products (id,rorder,item,qty,comment,r_tick)\
						VALUES(?,?,?,?,?,?)',[prodId,orderId,parseInt(row.id),qty,comment,1])
				}
				else{
					alasql(
							'INSERT INTO ro_products (id,rorder,item,qty,comment,r_tick)\
							VALUES(?,?,?,?,?,?)',[prodId,orderId,parseInt(row.id),qty,comment,0])	
				}
			}
		});
		
		window.location = "purchase.html?id=" + pId;
	}
})

$(".dispatchB").click(function(){
	var reorderId = "";
	var supplier = parseInt($("#suppliers select").val());
	var s_address = $("#s_address textarea").val();
	var s_phone = $("#s_phone input").val();
	var shipping = $("#shipping select").find("option:selected");
	shipping = $("#shipping select")
	shipping = shipping.find("option:selected")
	shipping = shipping[0].textContent;
	var sh_address = $("#sh_address textarea").val();
	var sh_phone = $("#sh_phone input").val();
	var billing = $("#billing input").val();
	var b_address = $("#b_address textarea").val();
	var b_phone = $("#b_phone input").val();
	
	var statusChoice = DB.choices("RETURN_STATUS");
	var status = "";
	$.each(statusChoice,function(index1,value1){
		if(value1.text=="Dispatched")
			status = value1.id;
	})
	
	var order_status = status
	var supplier_ref = $("#supplierRef input").val(); 
	var order_date = (new Date((new Date((new Date(new Date())).toISOString())).getTime() - ((new Date()).getTimezoneOffset() * 60000))).toISOString().slice(0, 19).replace('T', ' ');
	order_date = order_date.split(" ")[0];
	var order_received = ""
	if(id){
		reorderId = id;
		var result = alasql('UPDATE return_orders SET\
				pOrder =?,\
				supplier =?, \
				s_address =?, \
				s_phone =?, \
				shipping =?, \
				sh_address=?, \
				sh_phone=?, \
				billing =?, \
				b_address =?, \
				b_phone =?, \
				supplier_ref =?, \
				receivedD =?, \
				status =?, \
				orderD =? \
				WHERE id=?',[(pId),supplier,s_address,s_phone,shipping,sh_address,sh_phone,billing,b_address,b_phone,supplier_ref,order_received,order_status,order_date,id]);
		var rows = $("#tbody-cart").find("tr");
		$.each(rows,function(index,value){
			if(index>0){
				var row = value;
				var item = row.id;
				var qty = parseInt($(row.children[7]).find("input").val())
				var comment = $(row.children[8]).find("textarea").val()
				var check = row.children[8];
				var roP = alasql('SELECT * FROM ro_products where rorder=? and item=?',[id,parseInt(row.id)]);
				if(roP.length>0){
					roP = roP[0];
					var checkB = $(row.children[9]).find("input")[0];
					if(checkB.checked==true){
						alasql('update po_products set returned = ? where item = ? and porder = ?', [qty,parseInt(row.id),pId]);
						alasql(
								'UPDATE ro_products SET qty=?,comment=?,r_tick=?\
								where id=?',[qty,comment,1,roP.id])
					}
					else{
						alasql(
								'DELETE FROM ro_products where id=?',[roP.id])
					}
				}
				else{
					var prodId = alasql('SELECT MAX(id) + 1 as id FROM ro_products')[0]
					if(prodId.id==undefined)
						prodId = 1;
					else
						prodId = prodId.id;
					var checkB = $(row.children[9]).find("input")[0];
					if(checkB.checked==true){
						alasql('update po_products set returned = ? where item = ? and porder = ?', [qty,parseInt(row.id),pId]);
						alasql(
								'INSERT INTO ro_products (id,rorder,item,qty,comment,r_tick)\
								VALUES(?,?,?,?,?,?)',[prodId,orderId,parseInt(row.id),qty,comment,1])
					}
				}
			}
		});
		var statusChoice = DB.choices("RETURN_STATUS");
		var status = "";
		$.each(statusChoice,function(index1,value1){
			if(value1.text=="Dispatched")
				status = value1.id;
		})
		alasql("update return_orders set status=? where id=?",[status,id])
		window.location = "return.html?id=" + reorderId + "&pId=" + pId;
	}
	else{
		var rows = $("#tbody-cart").find("tr");
		var orderId = alasql('SELECT MAX(id) as id FROM return_orders')[0]
		if(orderId.id==undefined)
			orderId = 1;
		else
			orderId = orderId.id + 1;
		var returnNum = ("RO"+orderId); 
		reorderId = orderId;
		var order_date = (new Date((new Date((new Date(new Date())).toISOString())).getTime() - ((new Date()).getTimezoneOffset() * 60000))).toISOString().slice(0, 19).replace('T', ' ');
		order_date = order_date.split(" ")[0];
		var result = alasql('INSERT INTO return_orders \
				(id,number,pOrder,supplier,s_address,s_phone,shipping,sh_address,sh_phone,billing,b_address,b_phone,orderD,supplier_ref,receivedD,status)\
				VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[orderId,returnNum,(pId),supplier,s_address,s_phone,shipping,sh_address,sh_phone,billing ,b_address,b_phone,order_date,supplier_ref,order_received,order_status]);
		
		$.each(rows,function(index,value){
			if(index>0){
				var row = value;
				var item = row.id;
				var qty = parseInt($(row.children[7]).find("input").val())
				var comment = $(row.children[8]).find("textarea").val()
				var check = row.children[8];
				if(row.children[8]){}
				var prodId = alasql('SELECT MAX(id) + 1 as id FROM ro_products')[0]
				if(prodId.id==undefined)
					prodId = 1;
				else
					prodId = prodId.id;
				var checkB = $(row.children[9]).find("input")[0];
				if(checkB.checked==true){					
					alasql('update po_products set returned = ? where item = ? and porder = ?', [qty,parseInt(row.id),pId]);
					alasql(
							'INSERT INTO ro_products (id,rorder,item,qty,comment,r_tick)\
							VALUES(?,?,?,?,?,?)',[prodId,orderId,parseInt(row.id),qty,comment,1])
				}
				else{
					alasql('DELETE FROM ro_products where item=? and rorder=?',[parseInt(row.id), orderId])
				}
			}
		});
	}
	window.location = "return.html?id=" + reorderId + "&pId=" + pId;
})


