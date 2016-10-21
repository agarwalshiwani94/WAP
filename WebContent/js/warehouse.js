var purchaseCart = [];

// create search box
var rows = alasql('SELECT * FROM whouse;');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var option = $('<option>');
	option.attr('value', row.id);
	option.text(row.name);
	$('select[name="q1"]').append(option);
}

var rows = alasql('SELECT * FROM kind;');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var option = $('<option>');
	option.attr('value', row.id);
	option.text(row.text);
	$('select[name="q2"]').append(option);
}

// get search params
var q1 = parseInt($.url().param('q1') || $('select[name="q1"]').val());
$('select[name="q1"]').val(q1);
var q2 = parseInt($.url().param('q2') || '0');
$('select[name="q2"]').val(q2);
var q3 = $.url().param('q3') || '';
$('input[name="q3"]').val(q3);

// build sql
var sql = 'SELECT stock.id, stock.item, stock.balance, stock.available, stock.damaged, stock.on_order, stock.expected, stock.maxQ, stock.minQ, whouse.name, kind.text, item.code, item.maker, item.detail, item.price, item.unit \
	FROM stock \
	JOIN whouse ON whouse.id = stock.whouse \
	JOIN item ON item.id = stock.item \
	JOIN kind ON kind.id = item.kind \
	WHERE item.code LIKE ? ';

sql += q1 ? 'AND whouse.id = ' + q1 + ' ' : '';
sql += q2 ? 'AND kind.id = ' + q2 + ' ' : '';

// send query
var stocks = alasql(sql, [ '%' + q3 + '%' ]);

// build html table
var tbody = $('#tbody-stocks');
for (var i = 0; i < stocks.length; i++) {
	var stock = stocks[i];
	var excess = "-";
	var under = "-";
	if((stock.maxQ - stock.balance - stock.expected)<0){
		excess = stock.balance + stock.expected - stock.maxQ;
	}
	if((stock.available + stock.expected - stock.minQ)<0){
		under = stock.available + stock.expected - stock.minQ;
	}
	var tr = $('<tr data-href="stock.html?id=' + stock.id + '"></tr>');
	tr.append('<td>' + stock.text + '</td>');
	tr.append('<td>' + stock.code + '</td>');
	tr.append('<td style="text-align: centert;">' + numberWithCommas(stock.price) + '</td>');
	tr.append('<td>' + stock.unit + '</td>');
	tr.append('<td style="text-align: center;">' + stock.balance + '</td>');
	tr.append('<td style="text-align: center;">' + stock.available + '</td>');
	tr.append('<td style="text-align: center;">' + stock.expected + '</td>');
	if(under<0){
		tr.append('<td class="danger" style="text-align: center;">' + under + '</td>');
	}
	else
		tr.append('<td style="text-align: center;">' + under + '</td>');
	if(excess>0){
		tr.append('<td class="danger" style="text-align: center;">' + excess + '</td>');
	}
	else
		tr.append('<td style="text-align: center;">' + excess + '</td>');
	
	if(under<0){
		tr.append('<td style="text-align: right;"><button class="btn btn-xs btn-info addP" itemId="' + stock.item + '" minQ="' + under + '" maxQ="' + (stock.balance + stock.expected - stock.maxQ) +'">Purchase</button></td>')
	}
	if(excess>0){
		tr.append('<td style="text-align: right;"><button class="btn btn-xs btn-info transferP hidden" itemId="' + stock.item + '">Transfer</button></td>')
	}
	if(under=="-" || excess=="-")
		tr.append("<td> </td>")
	tr.appendTo(tbody);
}

$(".addP").click(function(){
	$("#myModal").modal('show')
	var tbody = $("#tbody-supplier");
	tbody.find("tr").remove();
	var itemId = parseInt($(this).attr('itemid'))
	var minQ = parseInt($(this).attr('minQ'))
	var maxQ = parseInt($(this).attr('maxQ'))
	minQ = (-1) * minQ
	maxQ = (-1) * maxQ
	$("#minQ")[0].textContent = minQ ;
	$("#maxQ")[0].textContent = maxQ;
	var contracts = alasql("SELECT * FROM contract_products where product=?",[itemId]);
	$.each(contracts,function(index,value){
		var contract = alasql("select * from contracts where id=?",[value.contract])[0];
		var date = (new Date((new Date((new Date(new Date())).toISOString())).getTime() - ((new Date()).getTimezoneOffset() * 60000))).toISOString().slice(0, 19).replace('T', ' ');
		date = date.split(" ")[0];
		var contractItems = [];
		if(contract.endD > date){
			var supplier = alasql('SELECT * FROM suppliers where id=?',[contract.supplier])[0];
			var tr = $("<tr></tr>");
			tr.append("<td><input type='checkbox' class='form-control cartItem'></td>")
			tr.append("<td class='hidden'>" + contract.supplier + "</td>")
			tr.append("<td>" + supplier.name + "</td>")
			tr.append("<td>" + value.price + "</td>");
			tbody.append(tr);
			var pOrders = alasql('SELECT * FROM purchase_orders where supplier=?',[supplier.id]);
			var days = 0;
			var numOrder = 0;
			$.each(pOrders,function(index2,value2){
				if(DB.choice(value2.status)=="Received"){
					var diff =  Math.floor(( Date.parse(value2.receivedD) - Date.parse(value2.orderD) ) / 86400000);
					days = days + diff
					numOrder++;
				}
			})
			if(days==0 || numOrder==0)
				days = "NA";
			else
				days = Math.ceil(days/numOrder);
			tr.append("<td>" + days + "</td>")
			tr.append("<td class='hidden'>" + itemId + "</td>")
			tr.append("<td class='hidden'>" + contract.id + "</td>")
		}
	})
	
	$("#orderQty").change(function(){
		var qty = parseInt($("#orderQty").val())
		if(qty < minQ){
			$(".warningMsg").removeClass("hidden")
		}
		else{
			$(".warningMsg").addClass("hidden")
		}
	})

})

	
	$(".addToCart").click(function(){
			var cb = $(".cartItem:checkbox:checked");
			var row = $(".cartItem:checkbox:checked")[0]
			row = $(row).parent().parent();
			var cartItem = {};
			var temp = $("#tbody-supplier").find("tr")
			if(temp.length>0){
				temp = temp.find("td")[5]
				temp = temp.textContent;
			}
			cartItem["item"] = parseInt(temp) ;
			cartItem["supplierId"] = parseInt(row.find("td")[1].textContent);
			cartItem["supplierName"] = row.find("td")[2].textContent;
			cartItem["qty"] = parseInt($("#orderQty").val());
			cartItem["price"] = parseInt(row.find("td")[3].textContent)
			cartItem["contract"] = parseInt(row.find("td")[6].textContent)
			var chk = true;
			$.each(purchaseCart,function(index2,value2){
				if(value2["item"]==parseInt(temp)){
					purchaseCart[index2]=cartItem;
					chk = false;
				}
			})	
			if(chk==true)
				purchaseCart.push(cartItem);	
			$(".badge")[0].textContent = parseInt($(".badge")[0].textContent) + 1;
			$("#myModal").modal('toggle');
	})

$("#openCart").click(function(){
	$("#cartModal").modal("show");
	var tbody = $("#tbody-cart");
	tbody.find("tr").remove();
	$.each(purchaseCart,function(index,value){
		var row = $("<tr>");
		var item = alasql('SELECT * FROM item where id=?',[value.item])[0];
		row.append("<td>" + item.code + "</td>")
		row.append("<td>" + value.supplierName + "</td>")
		row.append("<td>" + value.qty + "</td>")
		row.append("<td>" + value.price + "</td>")	
		tbody.append(row);
	})
	
})

$(".createOrder").click(function(){
	$(".modal-title")[0].textContent = "New Purchase Orders";
	$(".cartItems").addClass("hidden")
	$(".purchaseOrders").removeClass("hidden")
	var supplierList = [];
	var supplierName = [];
	var poList = [];
	//ID,NUMBER,CONTRACT,ORDER_DATE,STATUS,SUPPLIER,S_ADDRESS,S_PHONE,SHIPPING,SH_ADDRESS,SH_PHONE,BILLING,B_ADDRESS,B_PHONE,EXPECTED_DATE,RECEIVED_DATE
	$.each(purchaseCart,function(index,value){
		var contract = value.contract;
		var status = 0;
		var order_statuses = DB.choices("T_STATUS");
		$.each(order_statuses,function(index2,value2){
			if(value2.text=="In Draft")
				status = value2.id;
		})
		if(supplierList.indexOf(parseInt(value.supplierId))==-1){
			var supplier = alasql("select * from suppliers where id=?",[parseInt(value.supplierId)])[0];
			supplierList.push(supplier.id);
			supplierName.push(supplier.name);
			var s_address = supplier.unit + ", "  + supplier.street + "\n" + supplier.city + ", " + supplier.country + ", " + supplier.code
			var s_phone = supplier.phone;
			supplier = supplier.id;
			
			var warehouse = $('select[name="q1"]').val();
			var shipping = alasql('SELECT * from whouse where id=?',[parseInt(warehouse)])[0];
			var sh_address = shipping.addr;
			var sh_phone = shipping.tel;
			var shipping = shipping.name;
			
			var billing = shipping;
			var b_address = sh_address;
			var b_phone = sh_phone;
			
			var id = alasql('SELECT MAX(id) + 1 as id FROM purchase_orders')[0]
			id = id.id;
			var number = "P" + id;
			
			alasql('INSERT INTO purchase_orders (id,number,contract,supplier,s_address,s_phone,shipping,sh_address,sh_phone,billing,b_address,b_phone,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',[id,number,contract,supplier,s_address,s_phone,shipping,sh_address,sh_phone,billing ,b_address,b_phone,parseInt(status)]);
			poList.push(id);	
			
			var pId = alasql('SELECT MAX(id) + 1 as id FROM po_products')[0].id;
			var item = value.item;
			var qty = value.qty;
			alasql(
					'INSERT INTO po_products (id,porder,item,qty,received,lost,damaged,returned)\
					VALUES(?,?,?,?,?,?,?,?)',[pId,id,item,qty,0,0,0,0])
			var chk = alasql("SELECT * FROM po_products where id=?",[pId]);
		}
		else{
			var indexS = supplierList.indexOf(parseInt(value.supplierId));
			var id = poList[indexS];
			var pId = alasql('SELECT MAX(id) + 1 as id FROM po_products')[0].id;
			var item = value.item;
			var qty = value.qty;
			alasql(
					'INSERT INTO po_products (id,porder,item,qty,received,lost,damaged,returned)\
					VALUES(?,?,?,?,?,?,?,?)',[pId,id,item,qty,0,0,0,0])
			var chk = alasql("SELECT * FROM po_products where id=?",[pId]);
		}
		var tbody = $("#tbody-order");
		 $("#tbody-order").find("tr").remove();
		$.each(poList,function(index,value){
			var order = alasql("SELECT * FROM purchase_orders where id=?",[value])[0];
			var tr = $("<tr data-href='purchase_form.html?id=" + value + "' ></tr>");
			tr.append("<td><a href='purchase_form.html?id=" + value + "' target='_blank'>P" + value + "</a></td>")
			tr.append("<td>" + supplierName[index] + "</td>")
			tr.append("<td>" + DB.choice(order.status) + "</td>")
			tbody.append(tr)
		})
	});
	
	
	$("#cartModal").on("hidden.bs.modal", function () {
		purchaseCart = [];
		$(".cartItems").removeClass("hidden")
		$(".purchaseOrders").addClass("hidden")
	});
})

$(".placeOrder").click(function(){
	var tbody = $("#tbody-order");
	var rows = $("#tbody-order").find("tr");
	var whouse;
	$.each(rows,function(index,value){
		var id = $(value).find("td")[0];
		id = $(value).find("td")[0].textContent;
		id = id.substring(1);
		var sttaus = 0;
		var order_statuses = DB.choices("T_STATUS");
		$.each(order_statuses,function(index2,value2){
			if(value2.text=="Placed")
				status = value2.id;
		})
		var date = (new Date((new Date((new Date(new Date())).toISOString())).getTime() - ((new Date()).getTimezoneOffset() * 60000))).toISOString().slice(0, 19).replace('T', ' ');
		date = date.split(" ")[0];
		alasql("update purchase_orders set status=?, orderD=? where id=?",[parseInt(status), date, parseInt(id)]);
		var order = alasql("SELECT * FROM purchase_orders where id=?",[parseInt(id)])[0];
		var products = alasql("select * from po_products where porder=?",[order.id]);
		var warehouse = alasql("select * from whouse where name=?",[order.shipping])[0];
		whouse = warehouse.id;
		$.each(products,function(index2,value2){
			var check = alasql("SELECT * FROM stock where item=? and whouse=?", [value2.item,warehouse.id]);
			if(check.length<=0){
				var stockId = alasql('SELECT MAX(id) + 1 as id FROM stock')[0];
				alasql("INSERT INTO STOCK(id,item,whouse,balance,available,on_order,damaged,expected) values (" + stockId + "," + value2.item + "," +  warehouse.id 
						+ 0 + "," + 0 + "," + 0 + "," + 0  + "," + value2.qty +")");
			}
			else{
				check = check[0];
				var expectedN = check.expected + value2.qty;
				var result = alasql("UPDATE stock set expected=? where id=?",[expectedN,check.id]);
				result = alasql("select * from stock where id=?",[check.id])
			}	
		})
		
	})
	window.location = "warehouse.html?q1=" + whouse;
})


var purchases = alasql('SELECT * FROM purchase_orders');
$.each(purchases,function(indexP,valueP){
	var sql = 'SELECT trans.id, trans.date, trans.qty, trans.memo, whouse.name, item.code, item.price, stock.balance, item.unit, trans.orders \
		FROM stock \
		JOIN whouse ON whouse.id = stock.whouse \
		JOIN item ON item.id = stock.item \
		JOIN kind ON kind.id = item.kind \
		JOIN trans ON trans.stock = stock.id\
		WHERE item.code LIKE ? ';

	sql += q1 ? 'AND whouse.id = ' + q1 + ' ' : '';
	sql += q2 ? 'AND kind.id = ' + q2 + ' ' : '';
	sql += 'AND trans.orders = ' + valueP.id;

	// send query
	var rows = alasql(sql, [ '%' + q3 + '%' ]);

	for (var i = 0; i < rows.length; i++) {
		var row = rows[i];
		if(DB.choice(row.memo)!="SALE"){
			var contract = alasql('SELECT * FROM contracts where id=?',[valueP.contract])[0];
			var supplier = alasql('SELECT * FROM suppliers where id=?', [contract.supplier])[0];
			var tr = $('<tr></tr>');
			tr.append('<td>' + valueP.number + '</td>');
			tr.append('<td>' + row.name + '</td>');
			tr.append('<td>' + row.code + '</td>');
			tr.append('<td>' + row.date + '</td>');
			tr.append('<td>' + row.qty + '</td>');
			tr.append('<td>' + DB.choice(row.memo) + '</td>');
			tr.append('<td>' + supplier.name + '</td>');
			tr.appendTo($("#tbody-purchases"))
		}
	}

})


sql = 'SELECT trans.id, trans.date, trans.qty, trans.memo, whouse.name, item.code, item.price, stock.balance, item.unit \
	FROM stock \
	JOIN whouse ON whouse.id = stock.whouse \
	JOIN item ON item.id = stock.item \
	JOIN kind ON kind.id = item.kind \
	JOIN trans ON trans.stock = stock.id\
	WHERE item.code LIKE ? ';

sql += q1 ? 'AND whouse.id = ' + q1 + ' ' : '';
sql += q2 ? 'AND kind.id = ' + q2 + ' ' : '';

// send query
rows = alasql(sql, [ '%' + q3 + '%' ]);

for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	if(DB.choice(row.memo)=="SALE"){
		var tr = $('<tr></tr>');
		tr.append('<td>' + row.id + '</td>');
		tr.append('<td>' + row.name + '</td>');
		tr.append('<td>' + row.date + '</td>');
		tr.append('<td>' + row.qty + '</td>');
		tr.append('<td>' + DB.choice(row.memo) + '</td>');
		tr.appendTo($("#tbody-sales"))
	}
}

// click event
$('#tbody-order > tr').css('cursor', 'pointer').on('click', function() {
	window.location = $(this).attr('data-href');
});