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

var sales = alasql('SELECT * FROM sales_orders');
$.each(sales,function(indexP,valueP){
	var customer = alasql('SELECT * FROM customers where id=?', [valueP.customer])[0];
	var whouse = alasql('select * from whouse where name=?',[valueP.sh_from]);
	var sf_address = valueP.sf_address;
	if(whouse.length>0){
		sh_from = ("Warehouse:" + valueP.sh_from);
	}
	var tr = $('<tr></tr>');
	tr.append('<td data-href="sales.html?id=' + valueP.id + '">' + valueP.number + '</td>');
	tr.append('<td data-href="sales.html?id=' + valueP.id + '">' + customer.name + '</td>');
	if(valueP.orderD==null)
		tr.append('<td data-href="sales.html?id=' + valueP.id + '">--</td>');
	else
		tr.append('<td data-href="sales.html?id=' + valueP.id + '">' + valueP.orderD + '</td>');
	tr.append('<td data-href="sales.html?id=' + valueP.id + '">' + valueP.sh_from + '</td>');
	tr.append('<td data-href="sales.html?id=' + valueP.id + '">' + valueP.sh_address + '</td>');
	tr.append('<td>' + DB.choice(valueP.status) + '<button class="btn btn-xs btn-danger pDelete pull-right" pId="' + valueP.id + '"><span class="glyphicon glyphicon-trash"></span> Delete</button></td>');
	tr.appendTo($("#tbody-sales"))
})

$(".pDelete").click(function(){
	var pId = $(this).attr("pId");
	pId = parseInt(pId);
	alasql("DELETE FROM sales_orders where id=?",[pId]);
	//alasql("DELETE FROM trans where orders=?",[pId]);
	alasql("DELETE FROM so_products where sorder=?",[pId]);
	/*var returnO = alasql("SELECT * FROM return_orders where pOrder=?",[pId]);
	alasql("DELETE FROM return_orders where pOrder=?",[pId]);
	if(returnO.length>0)
		alasql("DELETE FROM ro_products where rorder=?",[returnO.id]);*/
	window.location = "sales_orders.html"
})


$('tbody > tr > td').css('cursor', 'pointer').on('click', function() {
	window.location = $(this).attr('data-href');
});
