var id = parseInt($.url().param('id'));

var warehouses = alasql('SELECT * FROM whouse');
for (var i = 0; i < warehouses.length; i++) {
	var $warehouse = warehouses[i];
	var shipTo = $('#shipping select optgroup')[0];
	$('<option>').attr('value', $warehouse.id).attr('data-tokens', $warehouse.name).text($warehouse.name).appendTo(shipTo);
}
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
	var order = alasql('SELECT * FROM return_orders where id=?', [id])[0];
	if(DB.choice(order.status)=="In Draft")
		window.location = "return-form.html?id=" + id + "&pId=" + order.pOrder;
	$(".returnNum")[0].textContent = "RO" + id;
	$(".returnNum")[1].textContent = $(".returnNum")[1].textContent + "RO" + id;
	var purchase = alasql('SELECT * FROM purchase_orders where id=?',[order.pOrder])[0]
	var link = "purchase.html?id=" + purchase.id;
	$("#linkToP").append("<a href='" + link + "'>P" + purchase.id+ "</a>")
	var contract = alasql('SELECT * FROM contracts WHERE id=?', [parseInt(purchase.contract)])[0]
	var supplier = alasql('SELECT * FROM suppliers where id=?', [parseInt(contract.supplier)])[0];
	
	var blah = $("#suppliers")
	$("#suppliers")[0].textContent = supplier.name;
	var address = order.s_address
	$("#s_address")[0].textContent = address;
	$("#s_phone")[0].textContent = order.s_phone;
	$("#shipping ")[0].textContent = order.shipping;
	address = order.sh_address
	$("#sh_address")[0].textContent = address
	$("#sh_phone")[0].textContent = order.sh_phone;
	$("#billing")[0].textContent = order.billing;
	$("#b_address")[0].textContent = order.b_address;
	$("#b_phone")[0].textContent = order.b_phone;
	$("#pOrderDate")[0].textContent = order.orderD;	
	$("#pReceivedDate")[0].textContent = order.receivedD;
	$("#pId")[0].textContent = "P" + purchase.id
	$("#roStatus")[0].textContent = DB.choice(parseInt(order.status));

//return item list
var items = alasql('SELECT * FROM ro_products where rorder=?',[id]);
$.each(items,function(index,value){
		var item = alasql('select * from item where id=?',[parseInt(value.item)])[0];
		var cart = $("#tbody-cart");
		var tr = $("<tr id=" + item.id + ">");
		var index = $("tbody-cart > tr").length;
		tr.append("<td>" + (index+1) + "</td>");
		var kind = alasql("SELECT * FROM kind where id=?", [parseInt(item.kind)])[0]
		kind = kind.text;
		var price = alasql("SELECT * from contract_products where contract=? and product=?", [contract.id,parseInt(item.id)])[0].price;
		tr.append("<td>" + kind + "</td>");
		tr.append("<td>" + item.code + "</td>");
		tr.append("<td>" + price + "</td>");
		tr.append("<td>" + value.qty + "</td>");
		tr.append("<td>" + value.comment + "</td>")
		tr.appendTo(cart);
})

	if($("#roStatus")[0].textContent=="Dispatched" || $("#roStatus")[0].textContent=="Received"){
		$(".dispatchB").addClass("hidden")
	}
}

$(".editB").click(function(){
	var order = alasql("select * from return_orders where id=?",[id])[0];
	window.location = "return-form.html?id=" + id + "&pId=" + order.pOrder;
})



