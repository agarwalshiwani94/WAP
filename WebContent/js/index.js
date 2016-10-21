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
var sql = 'SELECT item.id, item.code, kind.text, item.maker, item.detail, item.price, item.unit \
	FROM item \
	JOIN kind ON kind.id = item.kind \
	WHERE item.code LIKE ? ';

//sql += q1 ? 'AND whouse.id = ' + q1 + ' ' : '';
sql += q2 ? 'AND kind.id = ' + q2 + ' ' : '';

// send query
var stocks = alasql(sql, [ '%' + q3 + '%' ]);

// build html table
var tbody = $('#tbody-stocks');
for (var i = 0; i < stocks.length; i++) {
	var stock = stocks[i];
	
	var sql = 'SELECT whouse.name\
		FROM stock \
		JOIN whouse ON whouse.id = stock.whouse \
		JOIN item ON item.id = stock.item \
		WHERE item.id = ' + stock.id + ' ';

	sql += q1 ? 'AND whouse.id = ' + q1 + ' ' : '';
	var temp = alasql(sql);
	var whouses = [];
	$.each(temp,function(index,value){
		whouses.push(value.name);
	})
	temp = whouses.join(", ");
	if(temp.length > 0){
		var tr = $('<tr data-href="item.html?id=' + stock.id + '"></tr>');
		tr.append('<td>' + stock.text + '</td>');
		tr.append('<td>' + stock.code + '</td>');
		tr.append('<td>' + stock.maker + '</td>');
		tr.append('<td>' + stock.detail + '</td>');	
		tr.append('<td>' + temp + '</td>')
		tr.appendTo(tbody);
	}
}

// click event
$('tbody > tr').css('cursor', 'pointer').on('click', function() {
	window.location = $(this).attr('data-href');
});
