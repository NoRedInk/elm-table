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

    var Maybe = Elm.Maybe.make(elm);

    var empty = {
        ctor : 'Table',
        values : [],
        valueCtor : Maybe.Nothing
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

    var allSameCtors = function(items){
        var ctor = items[0].ctor;

        if (typeof ctor === "undefined" || ctor === null){
            return false;
        }

        for (var i = 1; i < items.length; i++){
            if (items[i].ctor !== ctor){
                return false;
            }
        }

        return true;
    };

    var onlyHasSingleValue = function(item){
        return Object.keys(item).length < 3;
    };

    /*
        An array is unboxable if:
            - all the ctors used were the same
            - the ctor only had a single argument
    */
    var isUnboxable = function(table){
        if (!allSameCtors(table.values)){
            return false;
        }

        if (!onlyHasSingleValue(table.values[0])){
            return false;
        }

        return true;
    };

    var unbox = function(table){
        table.valueCtor = Maybe.Just(table.values[0].ctor);

        var newArray = new Array(table.values.length);

        for (var i = 0; i < table.values.length; i++){
            newArray[i] = table.values[i]._0;
        }

        table.values = newArray;

        return table;
    };

    var unboxOne = function(v, table){
        var maybeCtor = table.valueCtor;
        if (maybeCtor === Maybe.Nothing){
            return v;
        }

        return v._0;
    };

    var needsReboxing = function(v, table){
        if (table.valueCtor === Maybe.Nothing){
            return false;
        }
        return v.ctor !== table.valueCtor._0;
    };

    var rebox = function(table){
        var maybeCtor = table.valueCtor;
        if (maybeCtor === Maybe.Nothing){
            return table;
        }

        var ctor = maybeCtor._0;
        table.valueCtor = Maybe.Nothing;

        var newArray = new Array(table.values.length);

        for (var i = 0; i < table.values.length; i++){
            newArray[i] = {
                ctor: ctor,
                _0: table.values[i]
            };
        }

        table.values = newArray;
        return table;
    };

    var reboxOne = function(i, table){
        var maybeCtor = table.valueCtor;
        if (maybeCtor === Maybe.Nothing){
            return table.values[i];
        }

        var ctor = maybeCtor._0;
        return {
            ctor: ctor,
            _0: table.values[i]
        };
    };

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

        var array = new Array(length);
        var i = 0;

        while (list.ctor !== '[]') {
            array[i] = list._0;
            list = list._1;
            i++;
        }

        var table = {
            ctor: 'Table',
            values: array,
            valueCtor: Maybe.Nothing
        };

        if (isUnboxable(table)){
            table = unbox(table);
        }

        return table;
    };

    var length = function(table){
        return table.values.length;
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
        var len = table.values.length;

        if (isOutOfBounds(i, len)){
            return Maybe.Nothing;
        }

        return Maybe.Just(reboxOne(i, table));
    };

    var update = function(i, f, table){
        var len = table.values.length;

        if (isOutOfBounds(i, len)){
            return table;
        }

        var newValue = f(reboxOne(i, table));

        if (needsReboxing(newValue, table)){
            table = rebox(table);
        }

        if (table.valueCtor === Maybe.Nothing){
            table.values[i] = newValue;
            return table;
        }

        table.values[i] = unboxOne(newValue, table);
        return table;
    };

    var updateMany = function(batch, table){
        batch.forEach(function(v){
            index = v._0;
            f = v._1;

            table = update(index, f);
        });

        if (isUnboxable(table)){
            table = unbox(table);
        }

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
        get: F2(get),
        map: F2(map),
        indexedMap: F2(indexedMap),
        update: F3(update),
        updateMany: F3(updateMany),
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
