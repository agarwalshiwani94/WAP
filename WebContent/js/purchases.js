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
var q1 = parseInt($.url().param('q1') || '0');
$('select[name="q1"]').val(q1);
var q2 = parseInt($.url().param('q2') || '0');
$('select[name="q2"]').val(q2);
var q3 = $.url().param('q3') || '';
$('input[name="q3"]').val(q3);

// build sql
var sql = 'SELECT stock.id, whouse.name, kind.text, item.code, item.maker, item.detail, item.price, stock.balance, item.unit \
	FROM stock \
	JOIN whouse ON whouse.id = stock.whouse \
	JOIN item ON item.id = stock.item \
	JOIN kind ON kind.id = item.kind \
	WHERE item.code LIKE ? ';

sql += q1 ? 'AND whouse.id = ' + q1 + ' ' : '';
sql += q2 ? 'AND kind.id = ' + q2 + ' ' : '';

// send query
var stocks = alasql(sql, [ '%' + q3 + '%' ]);

var purchases = alasql('SELECT * FROM purchase_orders');
$.each(purchases,function(indexP,valueP){
	var contract = alasql('SELECT * FROM contracts where id=?',[valueP.contract])[0];
	var supplier = alasql('SELECT * FROM suppliers where id=?', [contract.supplier])[0];
	var whouse = alasql('select * from whouse where name=?',[valueP.shipping]);
	var shipping = valueP.shipping;
	if(whouse.length>0){
		shipping = ("Warehouse:" + valueP.shipping);
	}
	var tr = $('<tr></tr>');
	tr.append('<td data-href="purchase.html?id=' + valueP.id + '">' + valueP.number + '</td>');
	tr.append('<td data-href="purchase.html?id=' + valueP.id + '">' + supplier.name + '</td>');
	if(valueP.orderD==null)
		tr.append('<td data-href="purchase.html?id=' + valueP.id + '">--</td>');
	else
		tr.append('<td data-href="purchase.html?id=' + valueP.id + '">' + valueP.orderD + '</td>');
	tr.append('<td data-href="purchase.html?id=' + valueP.id + '">' + shipping + '</td>');
	tr.append('<td data-href="purchase.html?id=' + valueP.id + '">Warehouse: ' + valueP.billing + '</td>');
	tr.append('<td>' + DB.choice(valueP.status) + '<button class="btn btn-xs btn-danger pDelete pull-right" pId="' + valueP.id + '"><span class="glyphicon glyphicon-trash"></span> Delete</button></td>');
	tr.appendTo($("#tbody-purchases"))
})

$(".pDelete").click(function(){
	var pId = $(this).attr("pId");
	pId = parseInt(pId);
	alasql("DELETE FROM purchase_orders where id=?",[pId]);
	alasql("DELETE FROM trans where orders=?",[pId]);
	alasql("DELETE FROM po_products where porder=?",[pId]);
	var returnO = alasql("SELECT * FROM return_orders where pOrder=?",[pId]);
	alasql("DELETE FROM return_orders where pOrder=?",[pId]);
	if(returnO.length>0)
		alasql("DELETE FROM ro_products where rorder=?",[returnO.id]);
	window.location = "purchases.html"
})


$('tbody > tr > td').css('cursor', 'pointer').on('click', function() {
	window.location = $(this).attr('data-href');
});
