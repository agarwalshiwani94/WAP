var id = parseInt($.url().param('id'));

if(id){
	
	//ID,NUMBER,CONTRACT,ORDER_DATE,STATUS,SUPPLIER,S_ADDRESS,S_PHONE,SHIPPING,SH_ADDRESS,SH_PHONE,BILLING,B_ADDRESS,B_PHONE
	var order = alasql('SELECT * FROM purchase_orders where id=?', [id])[0];
	if(DB.choice(order.status)=="In Draft"){
		window.location = "purchase_form.html?id=" + order.id
	}

	var contract = alasql('SELECT * FROM contracts WHERE id=?', [parseInt(order.contract)])[0]
	var supplier = alasql('SELECT * FROM suppliers where id=?', [parseInt(contract.supplier)])[0];
	
	//populate all addresses
	var temp = $("#suppliers");
	$("#suppliers")[0].textContent = supplier.name;
	temp = $("#s_address");
	var address = order.s_address
	//address = address.split("<br>").join("<br\>")
	$("#s_address").append(address);
	$("#s_phone")[0].textContent = order.s_phone;
	$("#shipping")[0].textContent = order.shipping;
	address = order.sh_address
	address = address.split("<br>").join("<br\>")
	$("#sh_address")[0].textContent = address;
	$("#sh_phone")[0].textContent = order.sh_phone;
	$("#billing")[0].textContent = order.billing;
	$("#b_address")[0].textContent = order.b_address;
	$("#b_phone")[0].textContent = order.b_phone;
	$("#pStatus")[0].textContent = DB.choice(parseInt(order.status));
	$("#pOrderDate")[0].textContent = order.orderD;
	$("#pReceivedDate")[0].textContent = order.receivedD;
	$("#pExpectedDate")[0].textContent = order.expectedD;
	$("#pId")[0].textContent = order.number;
	
	
	//populate items cart
	var items = alasql('SELECT * FROM po_products where porder=?',[id]);
	$.each(items,function(index,value){
		var item = alasql('select * from item where id=?',[parseInt(value.item)])[0];
		var cart = $("#tbody-cart");
		var tr = $("<tr id=" + value.id + ">");
		var index = $("#tbody-cart > tr").length;
		tr.append("<td>" + (index) + "</td>");
		var kind = alasql("SELECT * FROM kind where id=?", [parseInt(item.kind)])[0]
		kind = kind.text;
		var price = alasql("SELECT * from contract_products where contract=? and product=?", [contract.id,parseInt(item.id)])[0].price;
		var totalP = parseFloat(price) * parseInt(value.qty);
		tr.append("<td>" + kind + "</td>");
		tr.append("<td>" + item.code + "</td>");
		tr.append("<td>" + item.detail + "</td>");
		tr.append("<td>" + price + "</td>");
		tr.append("<td>" + value.qty + "</td>");
		tr.append("<td class='forR'>" + value.received + "</td>")
		tr.append("<td class='forR'>" + value.lost + "</td>")
		tr.append("<td class='forR'>" + value.damaged + "</td>")
		tr.append("<td class='forR'>" + value.returned + "</td>")
		tr.append("<td>" + totalP + "</td>");
		tr.appendTo(cart);
	})
	
	if(DB.choice(order.status)=="Placed"){
		$(".forR").addClass("hidden");
	}
	
	$(".orderNum")[0].textContent = order.number;
	$(".orderNum")[1].textContent = $(".orderNum")[1].textContent.replace(":",": " + order.number)
	
	
	//edit the purchase order
	$(".editB").click(function(){
		window.location = "purchase_form.html?id=" + id ;
	})
	
	$("#editCart").click(function(){
		$(this).addClass("hidden");
		$("#saveCart").removeClass("hidden")
		var cart = $("#tbody-cart");
		var rows = $("#tbody-cart").find("tr");
		$.each(rows,function(index,value){
			if(index>0){
				var row = $(value)
				var cols =  row.find("td");
				var received = cols[6].textContent;
				(cols[6]).textContent = "";
				$(cols[6]).append("<div class='col-xs-2'></div>");
				$(cols[6]).find("div").append("<input type='number' class='form-control verySm'></input>")
				$(cols[6]).find("input").val(received);
				$(cols[6]).find("input").width("30px")
				var lost = cols[7].textContent;
				(cols[7]).textContent = "";
				$(cols[7]).append("<input type='number' class='form-control verySm'></input>")
				$(cols[7]).find("input").width("30px")
				$(cols[7]).find("input").val(lost);
				var damaged = cols[8].textContent;
				(cols[8]).textContent = "";
				$(cols[8]).append("<input type='number' class='form-control verySm'></input>")
				$(cols[8]).find("input").width("30px")
				$(cols[8]).find("input").val(damaged);
				var returned = cols[9].textContent;
				(cols[9]).textContent = "";
				$(cols[9]).append("<input type='number' class='form-control verySm'></input>")
				$(cols[9]).find("input").width("30px")
				$(cols[9]).find("input").val(returned);	
			}		
		})
	})
	
	$("#saveCart").click(function(){
		$(this).addClass("hidden");
		$("#editCart").removeClass("hidden");
		var rows = $("#tbody-cart").find("tr");
		$.each(rows,function(index,value){
			if(index>0){
				var row = $(value)
				var cols =  row.find("td");
				var received = $(cols[6]).find("input").val();
				var lost = $(cols[7]).find("input").val();
				var damaged = $(cols[8]).find("input").val();
				var returned = $(cols[9]).find("input").val();
				$(cols[6]).find("input").remove()
				$(cols[7]).find("input").remove()
				$(cols[8]).find("input").remove()
				$(cols[9]).find("input").remove()
				cols[6].textContent = received;
				cols[7].textContent = lost;
				cols[8].textContent = damaged;
				cols[9].textContent = returned;
				alasql("update po_products set received=?, lost=?, damaged=?, returned=? where id=?", [parseInt(received), parseInt(lost), parseInt(damaged), parseInt(returned), parseInt(value.id)])
				var chk = alasql("select * from po_products where id=?",[parseInt(value.id)]);
			}	
		})
	})
	
	$("#createReturn").click(function(){
		var status = "";
		var statuses = DB.choices("RETURN_STATUS");
		$.each(statuses,function(index,value){
			if(value.text=="In Draft")
				status = value.id;
		})
		var draft = alasql('select * from return_orders where pOrder=? and status=?',[id,status]);
		if(draft.length>0){
			draft = draft[0];
			window.location = "return-form.html?id=" + draft.id + "&pId=" + id;
		}
		else
			window.location = "return-form.html?pId=" + id;
	})
	
	var returns = alasql('select * from return_orders where pOrder=? ',[id]);
	var rbody = $("#tbody-returns") 
	$.each(returns,function(index,value){
		var returnO = value;
		var tr= $("<tr></tr>");
		tr.append("<td>" + (index+1) + "</td>");
		tr.append("<td><a href='return.html?id=" + returnO.id + "&pId=" + id + "'>" + returnO.number + "</a></td>")
		if(returnO.orderD==null)
			tr.append("<td>--</td>")
		else
			tr.append("<td>" + returnO.orderD + "</td>")
		tr.append("<td>" + DB.choice(returnO.status) + "</td>")
		tr.appendTo(rbody);
	})
}