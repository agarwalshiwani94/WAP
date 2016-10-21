var rows = alasql('SELECT * FROM whouse;');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var option = $('<option>');
	option.attr('value', row.id);
	option.text(row.name);
	$("#q1").append(option);
	
	var option2 = $('<option>');
	option2.attr('value', row.id);
	option2.text(row.name);
	$("#q2").append(option2);
}

var id = parseInt($.url().param('id'));
$("input[name=id]").val(id);

var sql = 'SELECT item.id, item.code, kind.text, item.maker, item.detail, item.price, item.unit \
	FROM item \
	JOIN kind ON kind.id = item.kind \
	WHERE item.id = ? ';

// send query
var row = alasql(sql, [id])[0];
$('#image').attr('src', 'img/' + row.id + '.jpg');
$('#code').text(row.code);
$('#maker').text(row.maker);
$('#detail').text(row.detail);

var sql = 'SELECT item.id, whouse.name, item.code, item.price, stock.balance, stock.available, stock.on_order, stock.damaged, stock.expected, item.unit \
	FROM stock \
	JOIN whouse ON whouse.id = stock.whouse \
	JOIN item ON item.id = stock.item \
	JOIN kind ON kind.id = item.kind \
	WHERE item.id = ?';
var rows = alasql(sql, [ id ]);

var tbody = $('#tbody-stocks');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var tr = $('<tr></tr>');
	tr.append('<td>' + row.name + '</td>');
	tr.append('<td style="text-align: left;">' + numberWithCommas(row.price) + '</td>');
	tr.append('<td style="text-align: left;">' + row.balance + '</td>');
	tr.append('<td>' + row.available + '</td>');
	tr.append('<td>' + row.on_order + '</td>');
	tr.append('<td>' + row.damaged + '</td>');
	tr.append('<td>' + row.expected + '</td>');
	tr.append('<td>' + row.unit + '</td>');
	tr.appendTo(tbody);
}

var sql = 'SELECT trans.id, trans.date, trans.qty, trans.memo, whouse.name, item.code, item.price, stock.balance, item.unit \
	FROM stock \
	JOIN whouse ON whouse.id = stock.whouse \
	JOIN item ON item.id = stock.item \
	JOIN kind ON kind.id = item.kind \
	JOIN trans ON trans.stock = stock.id\
	WHERE item.id = ?';
var rows = alasql(sql, [ id ]);

for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var tr = $('<tr></tr>');
	tr.append('<td>' + row.id + '</td>');
	tr.append('<td>' + row.name + '</td>');
	tr.append('<td>' + row.date + '</td>');
	tr.append('<td>' + row.qty + '</td>');
	tr.append('<td>' + DB.choice(row.memo) + '</td>');
	tr.appendTo($("#tbody-transactions"))
}


$("#searchB").click(function(){
	var tbody = $('#tbody-stocks');
	var trows = tbody.find("tr");
	var wName = $("#q1 option:selected").text()
	$("#tbody-stocks > tr").removeClass("hidden");
	for(var i=0; i<trows.length; i++){
		var tempWName = $(trows[i]).find("td")[0];
		var tempWName2 = $(trows[i]).find("td")[1];
		if($("#q1 option:selected").val()!=0){
			if(tempWName.textContent!=wName){
				var trow = $(trows[i]);
				trow.addClass("hidden");
			}
		}
		else{
			$("#tbody-stocks > tr").removeClass("hidden");
		}
	}
})

$("#searchB2").click(function(){	
	tbody = $('#tbody-transactions');
	trows = tbody.find("tr");
	wName = $("#q2 option:selected").text()
	$("#tbody-transactions > tr").removeClass("hidden");
	for(var i=0; i<trows.length; i++){
		var tempWName = $(trows[i]).find("td")[0];
		var tempWName2 = $(trows[i]).find("td")[1];
		if($("#q2 option:selected").val()!=0){
			if(tempWName2.textContent!=wName){
				var trow = $(trows[i]);
				trow.addClass("hidden");
			}
		}
		else{
			$("#tbody-transactions > tr").removeClass("hidden");
		}
	}	
	
})


