var id = parseInt($.url().param('id'));

//populate status select
var order_statuses = DB.choices("SALES_STATUS");
$.each(order_statuses,function(index,value){
	$('<option>').attr('value', value.id).attr('data-tokens', value.text).text(value.text).appendTo($('#soStatus select'));
})
$('.selectpicker').selectpicker('refresh')


//select for customers
var customers = alasql('SELECT * FROM customers');
for (var i = 0; i < customers.length; i++) {
	var $customer = customers[i];
	$('<option>').attr('value', $customer.id).attr('data-tokens', $customer.name).text($customer.name).appendTo($('#customers select'));
	$('#billing input').val($customer.name);
}
$('.selectpicker').selectpicker('refresh')

var c_id = $("#customers select")[0];
c_id = parseInt(c_id.value);
var customer = alasql('SELECT * FROM customers WHERE id=?', [c_id])[0];
var c_address = customer.unit + ", "  + customer.street + "\n" + customer.city + ", " + customer.country + ", " + customer.postal
$("#c_address textarea").val(c_address);
$("#c_phone input").val(customer.phone);
$("#b_address textarea").val(c_address);
$("#b_phone input").val(customer.phone);
$("#b_address textarea").prop('disabled',true)
$("#b_phone input").prop('disabled',true)


//select for ship from 
var warehouses = alasql('SELECT * FROM whouse');
for (var i = 0; i < warehouses.length; i++) {
	var $warehouse = warehouses[i];
	var shipTo = $('#shipping select optgroup')[0];
	$('<option>').attr('value', $warehouse.id).attr('data-tokens', $warehouse.name).text($warehouse.name).appendTo(shipTo);
}

var suppliers = alasql('SELECT DISTINCT supplier FROM contracts');
for (var i = 0; i < suppliers.length; i++) {
	var $supplier = suppliers[i];
	$supplier = alasql('SELECT * FROM suppliers where id=?', [$supplier.supplier])[0]
	var shipTo = $('#shipping select optgroup')[1];
	$('<option>').attr('value', $supplier.id).attr('data-tokens', $supplier.name).text($supplier.name).appendTo(shipTo);
}
$('.selectpicker').selectpicker('refresh')


//populate the ship from address and phone
var shipType = $("#shipping select")[0].selectedOptions[0].parentNode.label;
if(shipType=="Warehouse"){
	var whouseId = $("#shipping select")[0];
	whouseId = parseInt(whouseId.value);
	var warehouse = alasql("select * from whouse where id=?",[whouseId])[0];
	$("#sh_address textarea").val(warehouse.addr);
	$("#sh_phone input").val(warehouse.tel);
}
else{
	var s_id = $("#shipping select")[0];
	s_id = parseInt(s_id.value);
	var supplier = alasql('SELECT * FROM suppliers WHERE id=?', [s_id])[0];
	var s_address = supplier.unit + ", "  + supplier.street + "\n" + supplier.city + ", " + supplier.country + ", " + supplier.code
	$("#sh_address textarea").val(s_address);
	$("#sh_phone input").val(supplier.phone);
}

//change of customer
$("#customer select").change(function(){
	var c_id = parseInt($("#customer select")[0].value);
	var customer = alasql('SELECT * FROM customers WHERE id=?', [c_id])[0];
	var c_address = customer.unit + ", "  + customer.street + "\n" + customer.city + ", " + customer.country + ", " + customer.postal
	$("#c_address textarea").val(c_address);
	$("#c_phone input").val(customer.phone);
	$("#b_address textarea").val(c_address);
	$("#b_phone input").val(customer.phone);
	$("#b_address textarea").prop('disabled',true)
	$("#b_phone input").prop('disabled',true)
})

//change of ship from address
$("#shipping select").change(function(){
	var shipType = $("#shipping select")[0].selectedOptions[0].parentNode.label;
	if(shipType=="Warehouse"){
		var whouseId = $("#shipping select")[0];
		whouseId = parseInt(whouseId.value);
		var warehouse = alasql("select * from whouse where id=?",[whouseId])[0];
		$("#sh_address textarea").val(warehouse.addr);
		$("#sh_phone input").val(warehouse.tel);
	}
	else{
		var s_id = $("#shipping select")[0];
		s_id = parseInt(s_id.value);
		var supplier = alasql('SELECT * FROM suppliers WHERE id=?', [s_id])[0];
		var s_address = supplier.unit + ", "  + supplier.street + "\n" + supplier.city + ", " + supplier.country + ", " + supplier.code
		$("#sh_address textarea").val(s_address);
		$("#sh_phone input").val(supplier.phone);
	}
})