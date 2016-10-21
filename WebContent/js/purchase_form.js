var id = parseInt($.url().param('id'));

//populate status select
var order_statuses = DB.choices("T_STATUS");
$.each(order_statuses,function(index,value){
	$('<option>').attr('value', value.id).attr('data-tokens', value.text).text(value.text).appendTo($('#pStatus select'));
})
$('.selectpicker').selectpicker('refresh')


//select for suppliers
var suppliers = alasql('SELECT DISTINCT supplier FROM contracts');
for (var i = 0; i < suppliers.length; i++) {
	var $supplier = suppliers[i];
	$supplier = alasql('SELECT * FROM suppliers where id=?', [$supplier.supplier])[0];
	$('<option>').attr('value', $supplier.id).attr('data-tokens', $supplier.name).text($supplier.name).appendTo($('#suppliers select'));
}

var s_id = $("#suppliers select")[0];
s_id = parseInt(s_id.value);
var supplier = alasql('SELECT * FROM suppliers WHERE id=?', [s_id])[0];
var s_address = supplier.unit + ", "  + supplier.street + "\n" + supplier.city + ", " + supplier.country + ", " + supplier.code
$("#s_address textarea").val(s_address);
$("#s_phone input").val(supplier.phone);

if(id){
	var order = alasql('SELECT * FROM purchase_orders where id=?', [id])[0];
	var contract = alasql('SELECT * FROM contracts WHERE id=?', [parseInt(order.contract)])[0]
	var supplier = alasql('SELECT * FROM suppliers where id=?', [parseInt(contract.supplier)])[0];
	
	//populate all addresses
	var temp = $("#suppliers");
	$("#suppliers select").val(supplier.id);
	temp = $("#suppliers");
	temp = $("#s_address");
	var address = order.s_address
	address = address.split("<br>").join("<br\>")
	$("#s_address textarea").val(address);
	$("#s_phone input").val(order.s_phone);
	
	var shipping_options = $("#shipping select").find("option");
	$.each(shipping_options,function(index,value){
		if(value.textContent==order.shipping){
			$("#shipping select").val(value.value);
		}
	})

	address = order.sh_address
	address = address.split("<br>").join("<br\>")
	$("#sh_address textarea").val(address);
	$("#sh_phone input").val(order.sh_phone);
	
	var billing_options = $("#billing select").find("option");
	$.each(billing_options,function(index,value){
		if(value.textContent==order.billing){
			$("#billing select").val(value.value);
		}
	})
	
	$("#b_address textarea").val(order.b_address);
	$("#b_phone input").val(order.b_phone);
	
	//populate items cart
	var items = alasql('SELECT * FROM po_products where porder=?',[id]);
	$.each(items,function(index,value){
		var item = alasql('select * from item where id=?',[parseInt(value.item)])[0];
		var cart = $("#tbody-cart");
		var tr = $("<tr id=" + item.id + ">");
		var index = $("#tbody-cart > tr").length;
		tr.append("<td>" + (index) + "</td>");
		var kind = alasql("SELECT * FROM kind where id=?", [parseInt(item.kind)])[0]
		kind = kind.text;
		var price = alasql("SELECT * from contract_products where contract=? and product=?", [contract.id,parseInt(item.id)])[0].price;
		tr.append("<td>" + kind + "</td>");
		tr.append("<td>" + item.code + "</td>");
		tr.append("<td>" + item.detail + "</td>");
		tr.append("<td>" + price + "</td>");
		tr.append("<td>" + value.qty + "</td>");
		var total = 0;
		var damaged = 0;
		var lost = 0;
		var qty = value.qty;
		supplier = parseInt($("#suppliers select").val());
		var pastOrders = alasql("SELECT * FROM purchase_orders where supplier=?",[supplier]);
		$.each(pastOrders,function(index2,value2){
			var pastTrans = alasql("SELECT * FROM po_products where item=? and porder=?",[item.id,value2.id]);
			if(pastTrans.length>0){
				pastTrans = pastTrans[0]
				total = total + pastTrans.qty;
				damaged = damaged + pastTrans.damaged;
				lost = lost + pastTrans.lost;
			}
		})
		var percentD = 0.0;
		if(total!=0)
			percentD = (percentD + damaged + lost) / total 
		qty = Math.ceil(qty + (qty*percentD))
		var cell = $("<td></td>");
		var input = $('<input type="number" class="form-control adjustVal"></input>')
		input.val(qty);
		cell.append(input);
	    tr.append(cell);	
		var totalP = parseFloat(price) * parseInt(qty);
		tr.append("<td>" + totalP + "<button class='btn btn-xs btn-danger pull-right delItem'>Remove</button></td>");
		tr.appendTo(cart);
		
	})
	
	$("#pId input").val(order.number);
	$("#pId input").prop("disabled",true)
	$("#pStatus select").val(order.status);
	$("#pOrderDate input").val(order.orderD);
	$("#pReceivedDate input").val(order.receivedD);
	$("#pExpectedDate input").val(order.expectedD);
}
else{
	var pId = alasql('SELECT MAX(id) + 1 as id FROM purchase_orders')[0]
	pId = pId.id;
	$("#pId input").val("P" + pId);
	$("#pId input").prop("disabled",true)
	
}


//populate items select
var items = alasql("select * from item");
$.each(items,function(indexI,valueI){
	var item = valueI;
	$('<option>').attr('value', item.id).attr('data-tokens', item.code).attr('class',"hidden").text(item.code).appendTo($("#item select"));
})

s_id = $("#suppliers select")[0];
s_id = parseInt(s_id.value);
var contract = alasql("SELECT * FROM contracts where supplier=? ORDER BY start desc limit 1", [s_id])[0];
var date = (new Date((new Date((new Date(new Date())).toISOString())).getTime() - ((new Date()).getTimezoneOffset() * 60000))).toISOString().slice(0, 19).replace('T', ' ');
date = date.split(" ")[0];
var contractItems = [];
if(contract.endD > date){
	var items = alasql("SELECT * from contract_products where contract=?", [contract.id]);
	$.each(items,function(indexI,valueI){
		contractItems.push(valueI.product);	
	})
}
var options = $("#item select").find("option");
$.each(options,function(indexO,valueO){
	if(contractItems.indexOf(parseInt(valueO.value))==-1)
		$(this).addClass("hidden");
	else
		$(this).removeClass("hidden")
})
$('.selectpicker').selectpicker('refresh')
var selectedItem = $("#item select").find("option").not(".hidden")[0];
var selectedItem = selectedItem.value;
$("#item select").val(selectedItem);
var price = alasql("SELECT * from contract_products where contract=? and product=?", [contract.id,parseInt(selectedItem)])[0].price;
var priceInput = $("#item_price input").val(price);
$("#item input").prop('disabled',true);


//for shipping and billing address
var warehouses = alasql('SELECT * FROM whouse');
for (var i = 0; i < warehouses.length; i++) {
	var $warehouse = warehouses[i];
	var shipTo = $('#shipping select optgroup')[0];
	var billTo = $('#billing select');
	$('<option>').attr('value', $warehouse.id).attr('data-tokens', $warehouse.name).text($warehouse.name).appendTo(shipTo);
	$('<option>').attr('value', $warehouse.id).attr('data-tokens', $warehouse.name).text($warehouse.name).appendTo(billTo);
}
$('.selectpicker').selectpicker('refresh')


var customers = [];

var shipType = $("#shipping select")[0].selectedOptions[0].parentNode.label;
if(shipType=="Warehouse"){
	var warehouse = alasql('SELECT * FROM whouse where id=?', [parseInt($("#shipping select")[0].value)])[0];
	$("#sh_address textarea").val(warehouse.addr);
	$("#sh_phone input").val(warehouse.tel);
	var span = $("span.itemInfo")[0];
	span = $(span);
	span.removeClass("hidden");
	var itemId = $('#item select').val();
	
	var sql = 'SELECT item.id, whouse.name, item.code, stock.balance, stock.available, stock.on_order, stock.damaged, stock.expected, stock.maxQ, stock.minQ \
		FROM stock \
		JOIN whouse ON whouse.id = stock.whouse \
		JOIN item ON item.id = stock.item \
		WHERE item.id = ? and whouse.id= ?';
	
	var rows = alasql(sql, [ parseInt(itemId), parseInt($("#shipping select")[0].value) ])
	var row = rows[0];

	var info = "Total Stock: " + row.balance + " <br>Stock Available: " + row.available + " <br>Stock On Order: " + row.on_order + " <br>Stock Damaged: " + row.damaged + " <br>Stock Expected: " + row.expected + " <br>Max Level:  " + row.maxQ + "<br>Min Level: " + row.minQ;
	$('[data-toggle="tooltip"]').prop("title", info);
	 $('[data-toggle="tooltip"]').tooltip();
	 
	 chkCapacity();
}
else{
	
}


//on change of supplier selected 
$('#suppliers select').on('change', function(){
	s_id = $("#suppliers select")[0];
	s_id = parseInt(s_id.value);
	supplier = alasql('SELECT * FROM suppliers WHERE id=?', [s_id])[0];
	s_address = supplier.unit + ", "  + supplier.street + "\n" + supplier.city + ", " + supplier.country + ", " + supplier.code
	$("#s_address textarea").val(s_address);
	$("#s_phone input").val(supplier.phone);

	var contract = alasql("SELECT * FROM contracts where supplier=? ORDER BY start desc limit 1", [s_id])[0];
	var date = (new Date((new Date((new Date(new Date())).toISOString())).getTime() - ((new Date()).getTimezoneOffset() * 60000))).toISOString().slice(0, 19).replace('T', ' ');
	date = date.split(" ")[0];
	var contractItems = [];
	if(contract.endD > date){
		var items = alasql("SELECT * from contract_products where contract=?", [contract.id]);
		$.each(items,function(indexI,valueI){
			contractItems.push(valueI.product);	
		})
	}

	var options = $("#item select").find("option");
	$.each(options,function(indexO,valueO){
		if(contractItems.indexOf(parseInt(valueO.value))==-1){
			$(this).addClass("hidden");
		}
		else{
			$(this).removeClass("hidden")
			$("#item select").val(parseInt(valueO.value));
		}
	})
	$('.selectpicker').selectpicker('refresh')
	var selectedItem = $("#item select").find("option").not(".hidden")[0];
	var selectedItem = selectedItem.value;
	$("#item select").val(selectedItem);
	var price = alasql("SELECT * from contract_products where contract=? and product=?", [contract.id,parseInt(selectedItem)])[0].price;
	var priceInput = $("#item_price input").val(price);
	$("#item_price input").prop('disabled',true);
	$("#tbody-cart > tr").remove();
	
	var span = $("span.itemInfo")[0];
	span = $(span);
	var itemId = $('#item select').val();
	
	var sql = 'SELECT item.id, whouse.name, item.code, stock.balance, stock.available, stock.on_order, stock.damaged, stock.expected, stock.maxQ, stock.minQ \
		FROM stock \
		JOIN whouse ON whouse.id = stock.whouse \
		JOIN item ON item.id = stock.item \
		WHERE item.id = ? and whouse.id= ?';
	
	var rows = alasql(sql, [ parseInt(itemId), parseInt($("#shipping select")[0].value) ])
	var row = rows[0];
	
	var info = "Total Stock: " + row.balance + " <br>Stock Available: " + row.available + " <br>Stock On Order: " + row.on_order + " <br>Stock Damaged: " + row.damaged + " <br>Stock Expected: " + row.expected + " <br>Max Level:  " + row.maxQ + "<br>Min Level: " + row.minQ;
	 $('[data-toggle="tooltip"]').prop("title", info);
	 $('[data-toggle="tooltip"]').tooltip();
	 
	 chkCapacity();
	 
});


//on change of shipping address 
$('#shipping select').on('change', function(){
	shipType = $("#shipping select")[0].selectedOptions[0].parentNode.label;
	if(shipType=="Warehouse"){
		var warehouse = alasql('SELECT * FROM whouse where id=?', [parseInt($("#shipping select")[0].value)])[0];
		$("#sh_address textarea").val(warehouse.addr);
		$("#sh_phone input").val(warehouse.tel);	
		var span = $("span.itemInfo")[0];
		span = $(span);
		span.removeClass("hidden");
		var itemId = $('#item select').val();
		
		var sql = 'SELECT item.id, whouse.name, item.code, stock.balance, stock.available, stock.on_order, stock.damaged, stock.expected, stock.maxQ, stock.minQ \
			FROM stock \
			JOIN whouse ON whouse.id = stock.whouse \
			JOIN item ON item.id = stock.item \
			WHERE item.id = ? and whouse.id= ?';
		
		var rows = alasql(sql, [ parseInt(itemId), parseInt($("#shipping select")[0].value) ])
		if(rows.length>0){
			var row = rows[0];
			
			var info = "Total Stock: " + row.balance + " <br>Stock Available: " + row.available + " <br>Stock On Order: " + row.on_order + " <br>Stock Damaged: " + row.damaged + " <br>Stock Expected: " + row.expected + " <br>Max Level:  " + row.maxQ + "<br>Min Level: " + row.minQ;
		    $("[data-toggle=tooltip]").attr('data-original-title', info);    
		    
		    chkCapacity();
		}    
	}
	else{
		
	}
});

//on change of billing address 
$('#billing select').on('change', function(){
	var warehouse = alasql('SELECT * FROM whouse where id=?', [parseInt($("#billing select")[0].value)])[0];
	$("#b_address textarea").val(warehouse.addr);
	$("#b_phone input").val(warehouse.tel);	
});


//on change of item selected
$('#item select').on('change', function(){
	s_id = $("#suppliers select")[0];
	s_id = parseInt(s_id.value);
	supplier = alasql('SELECT * FROM suppliers WHERE id=?', [s_id])[0];
	var contract = alasql("SELECT * FROM contracts where supplier=? ORDER BY start desc limit 1", [s_id])[0];
	var selectedItem = $("#item select").val();
	var price = alasql("SELECT * from contract_products where contract=? and product=?", [contract.id,parseInt(selectedItem)])[0].price;
	var priceInput = $("#item_price input").val(price);
	$("#item_price input").prop('disabled',true);
	var span = $("span.itemInfo")[0];
	span = $(span);
	var itemId = $('#item select').val();
	
	var sql = 'SELECT item.id, whouse.name, item.code, stock.balance, stock.available, stock.on_order, stock.damaged, stock.expected, stock.maxQ, stock.minQ \
		FROM stock \
		JOIN whouse ON whouse.id = stock.whouse \
		JOIN item ON item.id = stock.item \
		WHERE item.id = ? and whouse.id= ?';
	
	var rows = alasql(sql, [ parseInt(itemId), parseInt($("#shipping select")[0].value) ])
	var row = rows[0];
	
	var info = "Total Stock: " + row.balance + " <br>Stock Available: " + row.available + " <br>Stock On Order: " + row.on_order + " <br>Stock Damaged: " + row.damaged + " <br>Stock Expected: " + row.expected + " <br>Max Level:  " + row.maxQ + "<br>Min Level: " + row.minQ;
    $("[data-toggle=tooltip]").attr('data-original-title', info); 
	
});

//copy shipping address to billing address
function copyBaddress(){
	var address = $("#sh_address textarea")[0]
	$("#b_address textarea").val(address.value)
	var phone = $("#sh_phone input")[0]
	$("#b_phone input").val(phone.value);
	shipType = $("#shipping select")[0].selectedOptions[0].parentNode.label;
	/*if(shipType=="Warehouse"){
		var warehouse = alasql('SELECT * FROM whouse where id=?', [parseInt($("#shipping select")[0].value)])[0];
		$("#billing input").val(warehouse.manager);
	}*/
	var shipping = $("#shipping select")[0];
	$("#billing select").val(shipping.value);
	$(".selectpicker").selectpicker("refresh")
}


//add item to cart 
$("#add_item").click(function(){
	var item = parseInt($("#item select")[0].value);
	var qty = parseInt($("#item_qty input")[0].value);
	var unitP = parseFloat($("#item_price input")[0].value);

	item = alasql("SELECT * FROM item WHERE id=?", [item])[0];
	
	var rowId = "#" + item.id;
	var row = $(rowId);
	if(row.length>0){
		//qty = qty + parseInt(row.find("td")[5].textContent);
		qty = qty;
		totalP = qty * unitP;
		row.remove();
	}
	
	var cart = $("#tbody-cart");
	var tr = $("<tr id=" + item.id + ">");
	var index = $("#tbody-cart > tr").length;
	tr.append("<td>" + (index) + "</td>");
	var kind = alasql("SELECT * FROM kind where id=?", [parseInt(item.kind)])[0]
	kind = kind.text;
	tr.append("<td>" + kind + "</td>");
	tr.append("<td>" + item.code + "</td>");
	tr.append("<td>" + item.detail + "</td>");
	tr.append("<td>" + unitP + "</td>");
	tr.append("<td>" + qty + "</td>");
	var total = 0;
	var damaged = 0;
	var lost = 0;
	var supplier = parseInt($("#suppliers select").val());
	var pastOrders = alasql("SELECT * FROM purchase_orders where supplier=?",[supplier]);
	$.each(pastOrders,function(index2,value2){
		var pastTrans = alasql("SELECT * FROM po_products where item=? and porder=?",[item.id,value2.id]);
		if(pastTrans.length>0){
			pastTrans = pastTrans[0]
			total = total + pastTrans.qty;
			damaged = damaged + pastTrans.damaged;
			lost = lost + pastTrans.lost;
		}
	})
	var percentD = 0.0;
	if(total!=0)
		percentD = (percentD + damaged + lost) / total 
	qty = Math.ceil(qty + (qty*percentD))
    var cell = $("<td></td>");
	var input = $('<input type="number" class="form-control adjustVal col-sm-2"></input>')
	input.val(qty);
	cell.append(input);
	tr.append(cell);
	var totalP = qty * unitP;
	tr.append("<td>" + totalP + "<button class='btn btn-xs btn-danger pull-right delItem'>Remove</button></td>");
	tr.appendTo(cart);	
	chkCapacity()
	
	$(".delItem").click(function(){
		var row = $(this).parent().parent();
		row.remove();
	})	
})

function chkCapacity (){
	var chk = true;
	if(id){
		var pOrder = alasql("select * from purchase_orders where id=?",[id])[0];
		if(DB.choice(pOrder.status)=="In Draft"){
			chk = true;
		}
		else
			chk = false;
	}
	if(chk==true){
		shipType = $("#shipping select")[0].selectedOptions[0].parentNode.label;
		if(shipType=="Warehouse"){
			var warehouse = alasql('SELECT * FROM whouse where id=?', [parseInt($("#shipping select")[0].value)])[0];
			$("#sh_address textarea").val(warehouse.addr);
			$("#sh_phone input").val(warehouse.tel);	
		
			var cartRows = $("#tbody-cart > tr");
			$.each(cartRows,function(index,value){
				if(index>0){
					var cartRow = $(value);
					var qty = cartRow.find("td")
					qty = qty[5]
					qty = parseInt(qty.textContent);
					var sql = 'SELECT item.id, whouse.name, item.code, stock.balance, stock.available, stock.on_order, stock.damaged, stock.expected, stock.maxQ, stock.minQ \
						FROM stock \
						JOIN whouse ON whouse.id = stock.whouse \
						JOIN item ON item.id = stock.item \
						WHERE item.id = ? and whouse.id= ?';
		
					var rows = alasql(sql, [ parseInt(cartRow[0].id), parseInt($("#shipping select")[0].value) ])
					var row = rows[0];
					if((qty + row.balance + row.expected)>row.maxQ){
						$(this).addClass("warning");
					}	
				}
		
			})
		}
		else{
		
		}
	}
	$('tbody > tr.warning').css('cursor', 'pointer').on('click', function(e) {
		if($(this).hasClass("warning")){
			$("#myModal").modal("show")
			var tbody = $(".stats > tbody");
			$(".stats > tbody").find("tr").remove()
			var tr = $("<tr>");
			var cartRow = $(this);		
			var qty = cartRow.find("td")
			qty = qty[5]
			qty = parseInt(qty.textContent);
			var sql = 'SELECT item.id, whouse.name, item.code, stock.balance, stock.available, stock.on_order, stock.damaged, stock.expected, stock.maxQ, stock.minQ \
				FROM stock \
				JOIN whouse ON whouse.id = stock.whouse \
				JOIN item ON item.id = stock.item \
				WHERE item.id = ? and whouse.id= ?';

			var rows = alasql(sql, [ parseInt(cartRow[0].id), parseInt($("#shipping select")[0].value) ])
			var row = rows[0];

			tr.append("<td>" + cartRow.find("td")[2].textContent + "</td>");
			tr.append("<td>" + row.balance + "</td>");
			tr.append("<td>" + row.expected + "</td>");
			tr.append("<td>" + cartRow.find("td")[5].textContent + "</td>");
			tr.append("<td>" + cartRow.find("input").val() + "</td>");
			tr.append("<td>" + row.maxQ + "</td>");
			var excess = qty + row.balance + row.expected - row.maxQ
			tr.append("<td class='warning'>" + excess + "</td>")
			tbody.append(tr);
			
			var total = 0;
			var damaged = 0;
			var lost = 0;
			supplier = parseInt($("#suppliers select").val());
			var pastOrders = alasql("SELECT * FROM purchase_orders where supplier=?",[supplier]);
			$.each(pastOrders,function(index2,value2){
				var pastTrans = alasql("SELECT * FROM po_products where item=? and porder=?",[parseInt(cartRow[0].id),value2.id]);
				if(pastTrans.length>0){
					pastTrans = pastTrans[0]
					total = total + pastTrans.qty;
					damaged = damaged + pastTrans.damaged;
					lost = lost + pastTrans.lost;
				}
			})
			var percentD = 0.0;
			if(total!=0)
				percentD = (percentD + damaged + lost) / total 
			qty = Math.floor((row.maxQ - row.balance + row.expected)/(1+percentD))
			if(qty + (qty*percentD)>(row.maxQ - row.balance + row.expected))
				qty = qty - 1;
			var adjust = qty + (qty*percentD)
			$("#orderQty input").val(qty)

			$("#adjustedQty input").val(Math.ceil(adjust))
		
		$(".updateQ").click(function(){
			var newQ = $("#orderQty input").val()
			var newAdjust = $("#adjustedQty input").val()		
			cartRow.find("td")[5].textContent = newQ;
			cartRow.find("input").val(newAdjust) ;
			cartRow.removeClass("warning")
			$("#myModal").modal("toggle")
		})

		}
		
	});
	
}

$(".delItem").click(function(){
	var row = $(this).parent().parent()
	row.remove();
})


//save the created purchase order
$(".saveB").click(function(){
	var supplier = parseInt($("#suppliers select").val());
	var s_address = $("#s_address textarea").val();
	var s_phone = $("#s_phone input").val();
	var shipping = $("#shipping select").find("option:selected");
	shipping = $("#shipping select").find("option:selected")[0].textContent;
	var sh_address = $("#sh_address textarea").val();
	var sh_phone = $("#sh_phone input").val();
	var billing = $("#billing select").find("option:selected");
	billing = $("#billing select").find("option:selected")[0].textContent;
	var b_address = $("#b_address textarea").val();
	var b_phone = $("#b_phone input").val();	
	var order_status = parseInt($("#pStatus select").val());
	var order_date = $("#pOrderDate input").val();
	var order_expected = $("#pExpectedDate input").val();
	var order_received = $("#pReceivedDate input").val();
	
	var contract = alasql("SELECT * FROM contracts where supplier=? ORDER BY start desc limit 1", [supplier])[0];
	var date = "";

	
	if(id){
		var updateChk = false;
		var placedChk = false;
		var order = alasql('SELECT * FROM purchase_orders where id=?', [id])[0];
		if(DB.choice(order.status)!="Received" && DB.choice(order_status)=="Received"){
			updateChk = true;
		}
		if(DB.choice(order.status)!="Placed" && DB.choice(order_status)=="Placed"){
			placedChk = true;
		}
		if(placedChk==true && order_date==""){
			order_date = (new Date((new Date((new Date(new Date())).toISOString())).getTime() - ((new Date()).getTimezoneOffset() * 60000))).toISOString().slice(0, 19).replace('T', ' ');
			order_date = order_date.split(" ")[0];
		}
		var result = alasql(
				'UPDATE purchase_orders SET \
				contract = ?, \
				supplier = ?, \
				s_address = ?, \
				s_phone = ?, \
				shipping = ?, \
				sh_address =?, \
				sh_phone = ?, \
				billing = ?, \
				b_address =?, \
				b_phone = ?, \
				status = ?, \
				orderD = ?, \
				expectedD = ?, \
				receivedD = ?\
				where id = ?',[contract.id,supplier,s_address,s_phone,shipping,sh_address,sh_phone,billing,b_address,b_phone,order_status,order_date,order_expected,order_received,id])
				
		//ID,ORDER,ITEM,QTY
		//alasql("DELETE FROM po_products WHERE porder=?",[id]);
		var rows = $("#tbody-cart").find("tr");
		var oldP = alasql('select * from po_products where porder=?', [id]);
		var oldID = [];
		$.each(oldP,function(indexP,valueP){
			oldID.push(valueP.id);
		})
		
		$.each(rows,function(index,value){
			if(index>0){
				var row = value;
				var item = row.id;
				if(placedChk==true){
					var qty = parseInt($(row.children[6]).find("input").val())
				}
					
				else
					var qty = parseInt(row.children[5].textContent)
				var record = alasql('select * from po_products where porder=? and item=?', [id,parseInt(row.id)]);
				var oldQty = 0;
				if(record.length>0){
					record = record[0];
					oldQty = record.qty;
					alasql('update po_products set qty=? where id=?',[qty,record.id]);
					oldID.splice(oldID.indexOf(record.id),1);
				}
				else{
					var pId = alasql('SELECT MAX(id) + 1 as id FROM po_products')[0]
					pId = pId.id;
					var blah = alasql(
						'INSERT INTO po_products (id,porder,item,qty,received,lost,damaged,returned)\
						VALUES(?,?,?,?,?,?,?,?)',[pId,id,parseInt(row.id),qty,0,0,0,0])
				}
				var warehouse = alasql("select * from whouse where whouse.name=?",[shipping])[0];
				var check = alasql("SELECT * FROM stock where item=? and whouse=?", [parseInt(row.id),warehouse.id]);
				var oStatus = DB.choice(order_status)
				if(oStatus=="Placed"){
					if(check.length<=0){
						var stockId = alasql('SELECT MAX(id) + 1 as id FROM stock')[0];
						alasql("INSERT INTO STOCK(id,item,whouse,balance,available,on_order,damaged,expected) values (" + stockId + "," + parseInt(row.id) + "," +  warehouse.id 
								+ 0 + "," + 0 + "," + 0 + "," + 0  + "," + qty +")");
					}
					else{
						check = check[0];
						if(DB.choice(order.status)=="Placed"){
							var expectedN = check.expected - oldQty + qty 
							var result = alasql("UPDATE stock set expected=? where id=?",[expectedN,check.id]);
							result = alasql("select * from stock where id=?",[check.id])
						}
						else{
							var expectedN = check.expected + qty;
							var result = alasql("UPDATE stock set expected=? where id=?",[expectedN,check.id]);
							result = alasql("select * from stock where id=?",[check.id])
						}
					}	
				}
				
			}
		});
		$.each(oldID,function(indexI,valueI){
			alasql("delete from po_products where id=?",[valueI]);
		})
		
		
		if(updateChk==true){
			var warehouse = alasql("select * from whouse where whouse.name=?",[shipping])[0];
			var products = alasql("SELECT * FROM po_products WHERE porder=?",[id]);
			$.each(products,function(indexP,valueP){
				var product = valueP;
				var stock = alasql('SELECT * FROM stock where item=? and whouse=?',[product.item, warehouse.id])[0];
				var newB = stock.balance + product.qty;
				var newA = stock.available + product.qty 
				alasql('update stock set balance = ?, available = ? where id=?',[newB,newA,stock.id]);
				alasql('update po_products set received=? where id=?',[product.qty,product.id]);
				var date = (new Date((new Date((new Date(new Date())).toISOString())).getTime() - ((new Date()).getTimezoneOffset() * 60000))).toISOString().slice(0, 19).replace('T', ' ');
				date = date.split(" ")[0];
				alasql('update purchase_orders set receivedD=? where id=?',[date,id]);
			})
		}
		if(DB.choice(order_status)=="In Draft")
			window.location = "purchases.html";
		else
			window.location = "purchase.html?id=" + id ;
		
	}
	else{
		var orderId = alasql('SELECT MAX(id) + 1 as id FROM purchase_orders')[0];
		orderId = orderId.id;
		alasql('INSERT INTO purchase_orders (id,number,contract,supplier,s_address,s_phone,shipping,sh_address,sh_phone,billing,b_address,b_phone,status,orderD,expectedD,receivedD) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[orderId,("P"+orderId),contract.id,supplier,s_address,s_phone,shipping,sh_address,sh_phone,billing ,b_address,b_phone,order_status,order_date,order_expected,order_received]);
		
		var rows = $("#tbody-cart").find("tr");
		$.each(rows,function(index,value){
			if(index>0){
				var row = value;
				var item = row.id;
				var qty = parseInt(row.children[5].textContent)
				var pId = alasql('SELECT MAX(id) + 1 as id FROM po_products')[0]
				pId = pId.id;
				alasql(
						'INSERT INTO po_products (id,porder,item,qty,received,lost,damaged,returned)\
						VALUES(?,?,?,?,?,?,?,?)',[pId,orderId,parseInt(row.id),qty,0,0,0,0])	
				var warehouse = alasql("select * from whouse where whouse.name=?",[shipping])[0];
				var check = alasql("SELECT * FROM stock where item=? and whouse=?", [parseInt(row.id),warehouse.id]);
				if(DB.choice(order_status)=="Placed"){
					if(check.length<=0){
						var stockId = alasql('SELECT MAX(id) + 1 as id FROM stock')[0];
						alasql("INSERT INTO STOCK(id,item,whouse,balance,available,on_order,damaged,expected) values (" + stockId + "," + parseInt(row.id) + "," +  warehouse.id 
								+ 0 + "," + 0 + "," + 0 + "," + 0  + "," + qty +")");
					}
					else{
						check = check[0];
						var expectedN = qty + check.expected
						var result = alasql("UPDATE stock set expected=? where id=?",[expectedN,check.id]);
						result = alasql("select * from stock where id=?",[check.id])
						
					}	
				}
			}
		});
		if(DB.choice(order_status)=="In Draft")
			window.location = "purchases.html";
		else
			window.location = "purchase.html?id=" + orderId ;
	}
	
})

$('tbody > tr').on('click', function() {
	if($(this).hasClass("warning")){
		$(this).css('cursor', 'pointer')
		window.location = $(this).attr('data-href');
	}
});


$(".fixAll").click(function(){
	$("#allModal").modal("show")
	var tbody = $(".stats > tbody");
	$(".stats > tbody").find("tr").remove()
	var inventories = $('#tbody-cart > tr')
	$.each(inventories,function(index,value){
		if($(this).hasClass("warning")){
			var tr = $("<tr>");
			var cartRow = $(this);		
			var qty = cartRow.find("td")
			qty = qty[5]
			qty = parseInt(qty.textContent);
			var sql = 'SELECT item.id, whouse.name, item.code, stock.balance, stock.available, stock.on_order, stock.damaged, stock.expected, stock.maxQ, stock.minQ \
				FROM stock \
				JOIN whouse ON whouse.id = stock.whouse \
				JOIN item ON item.id = stock.item \
				WHERE item.id = ? and whouse.id= ?';

			var rows = alasql(sql, [ parseInt(cartRow[0].id), parseInt($("#shipping select")[0].value) ])
			var row = rows[0];
			tr.append("<td><div class='checkbox'><input type='checkbox' class='form-control fixChk' item='"+  cartRow[0].id + "'></input></div></td>")
			tr.append("<td>" + cartRow.find("td")[2].textContent + "</td>");
			tr.append("<td>" + row.balance + "</td>");
			tr.append("<td>" + row.expected + "</td>");
			tr.append("<td>" + cartRow.find("td")[5].textContent + "</td>");
			tr.append("<td>" + cartRow.find("input").val() + "</td>");
			tr.append("<td>" + row.maxQ + "</td>");
			var excess = qty + row.balance + row.expected - row.maxQ
			tr.append("<td class='warning'>" + excess + "</td>")
			
			var total = 0;
			var damaged = 0;
			var lost = 0;
			supplier = parseInt($("#suppliers select").val());
			var pastOrders = alasql("SELECT * FROM purchase_orders where supplier=?",[supplier]);
			$.each(pastOrders,function(index2,value2){
				var pastTrans = alasql("SELECT * FROM po_products where item=? and porder=?",[parseInt(cartRow[0].id),value2.id]);
				if(pastTrans.length>0){
					pastTrans = pastTrans[0]
					total = total + pastTrans.qty;
					damaged = damaged + pastTrans.damaged;
					lost = lost + pastTrans.lost;
				}
			})
			var percentD = 0.0;
			if(total!=0)
				percentD = (percentD + damaged + lost) / total 
			qty = Math.floor((row.maxQ - row.balance + row.expected)/(1+percentD))
			if(qty + (qty*percentD)>(row.maxQ - row.balance + row.expected))
				qty = qty - 1;
			var adjust = qty + (qty*percentD)
			tr.append("<td>" + Math.ceil(qty) + "</td>");
			tr.append("<td>" + Math.ceil(adjust) + "</td>")
			tbody.append(tr);
		}
	})
	
	$(".updateS").click(function(){
		var selected = $(".fixChk:checkbox:checked")
		$.each(selected,function(indexS,valueS){
			var row = $(this).parent().parent().parent();
			var item = parseInt($(this).attr("item"));
			var newQty = row.find("td")[8].textContent;
			var newAdj = row.find("td")[9].textContent;
			var rowId = "#" + item;
			var cartRow = $(rowId);
			cartRow.find("td")[5].textContent = newQty;
			cartRow.find("input").val(newAdj);
			cartRow.removeClass("warning")
			
		})
		$("#allModal").modal("toggle");
	})
	
	$(".updateA").click(function(){
		var selectedA = $(".fixChk:checkbox")
		$.each(selectedA,function(indexA,valueA){
			var row = $(this).parent().parent().parent();
			var item = parseInt($(this).attr("item"));
			var newQty = row.find("td")[8].textContent;
			var newAdj = row.find("td")[9].textContent;
			var rowId = "#" + item;
			var cartRow = $(rowId);
			cartRow.find("td")[5].textContent = newQty;
			cartRow.find("input").val(newAdj);
			cartRow.removeClass("warning")
			
		})
		$("#allModal").modal("hide");
	})

})

