// make is a function that takes an instance of the
// elm runtime
// returns an object where:
//      keys are names to be accessed in pure Elm
//      values are either functions or values
var make = function make(elm) {
    // If Native isn't already bound on elm, bind it!
    elm.Native = elm.Native || {};
    // then the same for our module
    elm.Native.Table = elm.Native.Table || {};

    // `values` is where the object returned by make ends up internally
    // return if it's already set, since you only want one definition of
    // values for speed reasons
    if (elm.Native.Table.values) return elm.Native.Table.values;

    var empty = {
        ctor : 'Table',
        values : []
    };

    var listLength = function(xs){
        var i = 0;
        while (xs.ctor !== '[]')
        {
            i++;
            xs = xs._1;
        }

        return i;
    }

    /*
        Intended to be a faster version of List.toArray
        Preallocates a block array as per https://www.youtube.com/watch?v=UJPdhx5zTaw
    */
    var fromList = function(list){
        var length = listLength(list);

        if (length < 1)
        {
            return empty;
        }

        var table = new Array(length);
        var i = 0;

        while (list.ctor !== '[]') {
            table[i] = list._0;
            list = list._1;
            i++;
        }

        return {
            ctor: 'Table',
            values: table
        };
    };

    var length = function(table){
        return table.values.length;
    };

    var get = function(i, table){
        return table.values[i];
    };

    var update = function(i, f, table){
        var len = table.values.length;

        // when len is bigger than the table
        // return early. we don't want to
        // create non-sequential arrays as
        // they get turned into hashmaps and
        // lose performance and size bonuses
        if (i >= len){
            return table;
        }

        var new_value = f(table.values[i]);
        table.values[i] = new_value;
        return table;
    };

    var updateMany = function(batch, table){
        batch.forEach(function(v){
            index = v._0;
            f = v._1;

            table = update(index, f);
        });

        return table;
    };

    var map = function(f, table){
        var len = table.values.length;

        for (var i = 0; i < len; i++){
            table = update(i, f, table);
        }

        return table;
    };

    var indexedMap = function(f, table){
        var len = table.values.length;

        for (var i = 0; i < len; i++){
            table = update(i, f(i), table);
        }

        return table;
    };

    var foldl = function(f, init, table){
        var len = table.values.length;

        for (var i = 0; i < len; i++){
            var item = table.values[i];

            init = f(item)(init);
        }

        return init;
    };

    var foldr = function(f, init, table){
        var len = table.values.length;

        for (var i = len - 1; i > -1; i--){
            var item = table.values[i];

            init = f(item)(init);
        }

        return init;
    };

    var indexedFoldl = function(f, init, table){
        var len = table.values.length;

        for (var i = 0; i < len; i++){
            var item = table.values[i];

            init = f(i)(item)(init);
        }

        return init;
    };

    var indexedFoldr = function(f, init, table){
        var len = table.values.length;

        for (var i = len; i > -1; i--){
            var item = table.values[i];

            init = f(i)(item)(init);
        }

        return init;
    };


    // return the object of your module's stuff!
    return {
        empty: empty,
        fromList: fromList,
        length: length,
        get: get,
        map: F2(map),
        indexedMap: F2(indexedMap),
        update: F2(update),
        updateMany: F2(updateMany),
        foldr: F3(foldr),
        foldl: F3(foldl),
        indexedFoldr: F3(indexedFoldr),
        indexedFoldl: F3(indexedFoldl)
    };
};

// setup code for Table
// Elm.Native.Table should be an object with
// a property `make` which is specified above
Elm.Native.Table = {};
Elm.Native.Table.make = make;
