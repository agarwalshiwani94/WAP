var DB = {};

DB.init = function() {
	if (window.confirm('are you sure to initialize database?')) {
		DB.load();
	}
};

DB.load = function() {
	alasql.options.joinstar = 'overwrite';

	// Classes
	alasql('DROP TABLE IF EXISTS kind;');
	alasql('CREATE TABLE kind(id INT IDENTITY, text STRING);');
	var pkind = alasql.promise('SELECT MATRIX * FROM CSV("data/KIND-KIND.csv", {headers: true})').then(function(kinds) {
		for (var i = 0; i < kinds.length; i++) {
			var kind = kinds[i];
			alasql('INSERT INTO kind VALUES(?,?);', kind);
		}
	});

	// Items
	alasql('DROP TABLE IF EXISTS item;');
	alasql('CREATE TABLE item(id INT IDENTITY, code STRING, kind INT, detail STRING, maker STRING, price INT, unit STRING);');
	var pitem = alasql.promise('SELECT MATRIX * FROM CSV("data/ITEM-ITEM.csv", {headers: true})').then(function(items) {
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			alasql('INSERT INTO item VALUES(?,?,?,?,?,?,?);', item);
		}
	});

	// Warehouses
	alasql('DROP TABLE IF EXISTS whouse;');
	alasql('CREATE TABLE whouse(id INT IDENTITY, name STRING, addr STRING, tel STRING, manager STRING, email STRING);');
	var pwhouse = alasql.promise('SELECT MATRIX * FROM CSV("data/WHOUSE-WHOUSE.csv", {headers: true})').then(
			function(whouses) {
				for (var i = 0; i < whouses.length; i++) {
					var whouse = whouses[i];
					alasql('INSERT INTO whouse VALUES(?,?,?,?,?,?);', whouse);
				}
			});

	// Inventories
	alasql('DROP TABLE IF EXISTS stock;');
	alasql('CREATE TABLE stock(id INT IDENTITY, item INT, whouse INT, balance INT, available INT, on_order INT, damaged INT, expected INT, minQ INT, maxQ INT );');
	var pstock = alasql.promise('SELECT MATRIX * FROM CSV("data/STOCKS-STOCKS.csv", {headers: true})').then(
			function(stocks) {
				for (var i = 0; i < stocks.length; i++) {
					var stock = stocks[i];
					alasql('INSERT INTO stock VALUES(?,?,?,?,?,?,?,?,?,?);', stock);
				}
			});

	// Transaction
	alasql('DROP TABLE IF EXISTS trans;');
	alasql('CREATE TABLE trans(id INT IDENTITY, stock INT, date DATE, qty INT, balance INT, memo INT, orders INT);');
	var ptrans = alasql.promise('SELECT MATRIX * FROM CSV("data/TRANSACTION-TRANSACTION.csv", {headers: true})').then(
			function(transs) {
				for (var i = 0; i < transs.length; i++) {
					var trans = transs[i];
					alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?);', trans);
				}
			});
	
	// choice
	alasql('DROP TABLE IF EXISTS choice;');
	alasql('CREATE TABLE choice(id INT IDENTITY, name STRING, text STRING);');
	var pchoice = alasql.promise('SELECT MATRIX * FROM CSV("data/CHOICE-CHOICE.csv", {headers: true})').then(
			function(choices) {
				for (var i = 0; i < choices.length; i++) {
					alasql('INSERT INTO choice VALUES(?,?,?);', choices[i]);
				}
			});

	//suppliers
	alasql('DROP TABLE IF EXISTS suppliers;');
	alasql('CREATE TABLE suppliers(id INT IDENTITY, number STRING, name STRING, phone STRING, unit STRING, street STRING, city STRING, country STRING, code STRING);');
	var psupplier = alasql.promise('SELECT MATRIX * FROM CSV("data/SUPPLIERS-SUPPLIERS.csv", {headers: true})').then(
			function(suppliers) {
				for (var i = 0; i < suppliers.length; i++) {
					alasql('INSERT INTO suppliers VALUES(?,?,?,?,?,?,?,?,?);', suppliers[i]);
				}
			});

	//contracts
	alasql('DROP TABLE IF EXISTS contracts;');
	alasql('CREATE TABLE contracts(id INT IDENTITY, number STRING, supplier INT, startD DATE, endD DATE);');
	var pcontract = alasql.promise('SELECT MATRIX * FROM CSV("data/SUPPLIER-CONTRACT.csv", {headers: true})').then(
			function(contracts) {
				for (var i = 0; i <contracts.length; i++) {
					alasql('INSERT INTO contracts VALUES(?,?,?,?,?);', contracts[i]);
				}
			});
	
	//conract-products
	alasql('DROP TABLE IF EXISTS contract_products;');
	alasql('CREATE TABLE contract_products(id INT IDENTITY, contract INT, product INT, price float);');
	var pcontractp = alasql.promise('SELECT MATRIX * FROM CSV("data/CONTRACT-PRODUCT.csv", {headers: true})').then(
			function(contractP) {
				for (var i = 0; i <contractP.length; i++) {
					alasql('INSERT INTO contract_products VALUES(?,?,?,?);', contractP[i]);
				}
			});
	
	
	//purchase-orders
	alasql('DROP TABLE IF EXISTS purchase_orders;');
	alasql('CREATE TABLE purchase_orders(id INT IDENTITY, number STRING, contract INT, orderD DATE, status INT, supplier INT, s_address STRING, s_phone STRING, shipping STRING, sh_address STRING, sh_phone STRING, billing STRING, b_address STRING, b_phone STRING, expectedD DATE, receivedD DATE);');
	var ppurchase = alasql.promise('SELECT MATRIX * FROM CSV("data/PURCHASE-ORDER.csv", {headers: true})').then(
			function(purchase) {
				for (var i = 0; i <purchase.length; i++) {
					alasql('INSERT INTO purchase_orders VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);', purchase[i]);
				}
			});

	//purchase-order-products
	alasql('DROP TABLE IF EXISTS po_products;');
	alasql('CREATE TABLE po_products(id INT IDENTITY, porder INT, item INT, qty INT, received INT, lost INT, damaged INT, returned INT);');
	var po_products = alasql.promise('SELECT MATRIX * FROM CSV("data/PURCHASE-ORDER-PRODUCT.csv", {headers: true})').then(
			function(purchase_products) {
				for (var i = 0; i < purchase_products.length; i++) {
					alasql('INSERT INTO po_products VALUES(?,?,?,?,?,?,?,?);', purchase_products[i]);
				}
			});
	
	//return-orders
	alasql('DROP TABLE IF EXISTS return_orders;');
	alasql('CREATE TABLE return_orders(id INT IDENTITY, number STRING, pOrder INT, orderD DATE, status INT, supplier INT, s_address STRING, s_phone STRING, shipping STRING, sh_address STRING, sh_phone STRING, billing STRING, b_address STRING, b_phone STRING, supplier_ref STRING, receivedD DATE);');
	var preturn = alasql.promise('SELECT MATRIX * FROM CSV("data/RETURN-ORDERS.csv", {headers: true})').then(
			function(returns) {
				for (var i = 0; i <returns.length; i++) {
					alasql('INSERT INTO return_orders VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);', returns[i]);
				}
			});

	//return-order-products
	alasql('DROP TABLE IF EXISTS ro_products;');
	alasql('CREATE TABLE ro_products(id INT IDENTITY, rorder INT, item INT, qty INT, comment STRING, r_tick INT);');
	var ro_products = alasql.promise('SELECT MATRIX * FROM CSV("data/RETURN-ORDER-PRODUCT.csv", {headers: true})').then(
			function(return_products) {
				for (var i = 0; i < return_products.length; i++) {
					alasql('INSERT INTO ro_products VALUES(?,?,?,?,?,?);', return_products[i]);
				}
			});
	
	//sales-orders 
	alasql('DROP TABLE IF EXISTS sales_orders;');
	alasql('CREATE TABLE sales_orders(id INT IDENTITY, number STRING, customer INT, sh_address STRING, sh_phone STRING, sh_from STRING, sf_address STRING, sf_phone STRING, billing STRING, b_address STRING, b_phone STRING, orderD DATE, receivedD DATE, expectedD DATE, status INT, ref INT);');
	var psales = alasql.promise('SELECT MATRIX * FROM CSV("data/SALES-ORDER.csv", {headers: true})').then(
			function(sales) {
				for (var i = 0; i <sales.length; i++) {
					alasql('INSERT INTO sales_orders VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);', sales[i]);
				}
			});

	//sales-order-products
	alasql('DROP TABLE IF EXISTS so_products;');
	alasql('CREATE TABLE so_products(id INT IDENTITY, sorder INT, item INT, qty INT, received INT, lost INT, damaged INT, returned INT);');
	var so_products = alasql.promise('SELECT MATRIX * FROM CSV("data/SALES-ORDER-PRODUCTS.csv", {headers: true})').then(
			function(sales_products) {
				for (var i = 0; i < sales_products.length; i++) {
					alasql('INSERT INTO so_products VALUES(?,?,?,?,?,?,?,?);', sales_products[i]);
				}
			});
	
	//customers
	alasql('DROP TABLE IF EXISTS customers;');
	alasql('CREATE TABLE customers(id INT IDENTITY, number STRING, name STRING, unit STRING, street STRING, city STRING, state STRING, country STRING, postal STRING, phone STRING);');
	var pcustomers = alasql.promise('SELECT MATRIX * FROM CSV("data/CUSTOMERS-CUSTOMERS.csv", {headers: true})').then(
			function(customers) {
				for (var i = 0; i < customers.length; i++) {
					alasql('INSERT INTO customers VALUES(?,?,?,?,?,?,?,?,?,?);', customers[i]);
				}
			});
	
	
	// Reload page
	Promise.all([ pkind, pitem, pwhouse, pstock, ptrans, pchoice, pcontractp, pcontract, psupplier, po_products, psales, pcustomers]).then(function() {
		window.location.reload(true);
	});
};

DB.choice = function(id) {
	var choices = alasql('SELECT text FROM choice WHERE id = ?', [ id ]);
	if (choices.length) {
		return choices[0].text;
	} else {
		return '';
	}
};

DB.choices = function(name) {
	return alasql('SELECT id, text FROM choice WHERE name = ?', [ name ]);
};

DB.remove = function() {
	if (window.confirm('are you sure to delete dababase?')) {
		alasql('DROP localStorage DATABASE STK')
	}
};

// add commas to number
function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// DO NOT CHANGE!
alasql.promise = function(sql, params) {
	return new Promise(function(resolve, reject) {
		alasql(sql, params, function(data, err) {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
};

// connect to database
try {
	alasql('ATTACH localStorage DATABASE STK;');
	alasql('USE STK;');
} catch (e) {
	alasql('CREATE localStorage DATABASE STK;');
	alasql('ATTACH localStorage DATABASE STK;');
	alasql('USE STK;');
	DB.load();
}
