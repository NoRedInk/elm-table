// make is a function that takes an instance of the
// elm runtime
// returns an object where:
//      keys are names to be accessed in pure Elm
//      are either functions or
var make = function make(elm) {
    // If Native isn't already bound on elm, bind it!
    elm.Native = elm.Native || {};
    // then the same for our module
    elm.Native.Table = elm.Native.Table || {};

    // ` is where the object returned by make ends up internally
    // return if it's already set, since you only want one definition of
    // for speed reasons
    if (elm.Native.Table) return elm.Native.Table;

    var Maybe = Elm.Maybe.make(elm);

    var empty = [];

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

        return table;
    };

    var length = function(table){
        return table.length;
    };

    // when len is bigger than the table
    // return early. we don't want to
    // create non-sequential arrays as
    // they get turned into hashmaps and
    // lose performance and size bonuses
    var isOutOfBounds = function(i, len){
        return (i < 0 || i >= len);
    };

    var get = function(i, table){
        var len = table.length;

        if (isOutOfBounds(i, len)){
            return Maybe.Nothing;
        }

        return Maybe.Just(table[i]);
    };

    var unsafeGet = function(i, table){
        return table[i];
    };

    var update = function(i, f, table){
        var len = table.length;

        if (isOutOfBounds(i, len)){
            return table;
        }

        var new_value = f(table[i]);
        table[i] = new_value;
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

    function map (f, table)
    {
        var len = table.length;

        for (var i = 0; i < len; i++)
        {
            table = update(i, f, table);
        }

        return table;
    };

    var indexedMap = function(f, table){
        var len = table.length;

        for (var i = 0; i < len; i++){
            table = update(i, f(i), table);
        }

        return table;
    };

    var foldl = function(f, init, table){
        var len = table.length;

        for (var i = 0; i < len; i++){
            var item = table[i];

            init = f(item)(init);
        }

        return init;
    };

    var foldr = function(f, init, table){
        var len = table.length;

        for (var i = len - 1; i > -1; i--){
            var item = table[i];

            init = f(item)(init);
        }

        return init;
    };

    var indexedFoldl = function(f, init, table){
        var len = table.length;

        for (var i = 0; i < len; i++){
            var item = table[i];

            init = f(i)(item)(init);
        }

        return init;
    };

    var indexedFoldr = function(f, init, table){
        var len = table.length;

        for (var i = len; i > -1; i--){
            var item = table[i];

            init = f(i)(item)(init);
        }

        return init;
    };


    // return the object of your module's stuff!
    return {
        empty: empty,
        fromList: fromList,
        length: length,
        get: F2(get),
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
