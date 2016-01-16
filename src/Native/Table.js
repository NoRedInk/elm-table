Elm.Native.Table = {};
Elm.Native.Table.make = function(localRuntime) {

	localRuntime.Native = localRuntime.Native || {};
	localRuntime.Native.Table = localRuntime.Native.Table || {};
	if (localRuntime.Native.Table.values)
	{
		return localRuntime.Native.Table.values;
	}

	var Maybe = Elm.Maybe.make(elm);


	function fromList(list)
	{
		var temp = list;
		var len = 0;
		while (temp.ctor !== '[]')
		{
			temp = temp._1;
			++len;
		}

		if (len < 1)
		{
			return [];
		}

		var table = new Array(len);
		var i = 0;

		while (list.ctor !== '[]')
		{
			table[i] = list._0;
			list = list._1;
			++i;
		}

		return table;
	}


	function get(i, table)
	{
		if (i < 0 || i >= table.length)
		{
			return Maybe.Nothing;
		}

		return Maybe.Just(table[i]);
	}


	function getUnsafe(i, table)
	{
		return table[i];
	}


	function clone(table)
	{
		var i = table.length;
		var newTable = new Array(i);
		while (i--)
		{
			newTable[i] = table[i];
		}
	}


	function update(index, func, table)
	{
		var len = table.length;

		if (index < 0 || index >= len)
		{
			return table;
		}

		var newTable = clone(table);
		newTable[index] = func(newTable[index]);
		return newTable;
	}


	function updateMany(updaters, table)
	{
		var len = table.length;
		var newTable = clone(table);

		while (updaters.ctor !== '[]')
		{
			var updater = updaters._0;
			var index = updater._0;
			updaters = updaters._1;
			if (index < 0 || index >= len)
			{
				continue;
			}
			newTable[index] = updater._1(newTable[index]);
		}

		return newTable;
	}


	function map(func, table)
	{
		var i = table.length;
		var newTable = new Array(i);
		while (--i)
		{
			newTable[i] = func(table[i]);
		}
		return newTable;
	}


	function indexedMap(func, table)
	{
		var i = table.length;
		var newTable = new Array(i);
		while (--i)
		{
			newTable[i] = A2(func, i, table[i]);
		}
		return newTable;
	}


	function foldl(func, acc, table)
	{
		var len = table.length;

		for (var i = 0; i < len; ++i)
		{
			acc = A2(func, table[i], acc);
		}
		return acc;
	}


	function foldr(func, acc, table)
	{
		var i = table.length;

		while (--i)
		{
			acc = A2(func, table[i], acc);
		}
		return acc;
	}


	function indexedFoldl(func, acc, table)
	{
		var len = table.length;

		for (var i = 0; i < len; ++i)
		{
			acc = A3(func, i, table[i], acc);
		}
		return acc;
	}


	function indexedFoldr(func, acc, table)
	{
		var i = table.length;

		while (--i)
		{
			acc = A3(func, i, table[i], acc);
		}
		return acc;
	}


	return localRuntime.Native.Table.values = {
		fromList: fromList,
		get: F2(get),
		update: F2(update),
		updateMany: F2(updateMany),
		map: F2(map),
		indexedMap: F2(indexedMap),
		foldr: F3(foldr),
		foldl: F3(foldl),
		indexedFoldr: F3(indexedFoldr),
		indexedFoldl: F3(indexedFoldl)
	};
};