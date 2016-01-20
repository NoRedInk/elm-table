module Array
    ( Array
    , empty, repeat, initialize, fromList
    , isEmpty, length, push, append
    , get, set
    , slice, toList, toIndexedList
    , map, indexedMap, filter, foldl, foldr
    )
    where


{-| Representation of fast immutable arrays. You can create arrays of integers
(`Array Int`) or strings (`Array String`) or any other type of value you can
dream up.
-}
type Array a
  = FullNode Int (Table (Array a))
  | RelaxNode (Table Int) (Table (Array a))
  | Leaf (Table a)


{-| Initialize an array. `initialize n f` creates an array of length `n` with
the element at index `i` initialized to the result of `(f i)`.

    initialize 4 identity    == fromList [0,1,2,3]
    initialize 4 (\n -> n*n) == fromList [0,1,4,9]
    initialize 4 (always 0)  == fromList [0,0,0,0]
-}
initialize : Int -> (Int -> a) -> Array a
initialize size valueByIndex =
  let
    height =
      floor (logBase 32 size)
  in



initializeHelp : Int -> Int -> Int -> (Int -> a) -> Array a
initializeHelp size offset height valueByIndex =
  if height <= 0 then
    Leaf (init 32 offset valueByIndex) -- wrong, need to handle relaxed ones, less than 32 elements

  else
    let
      numSlots =
        32 ^ height

      slotsNeeded =
        size - offset

      newHeight =
        height - 1

      makeSubArray index =
        initializeHelp size (offset + index * 32 ^ newHeight) newHeight valueByIndex
    in
      if numSlots <= slotsNeeded then
        FullNode height (init 32 0 makeSubArray)

      else
        let
          numberLessThan32 =
            ceiling (32 * slotsNeeded / numSlots)

          makeSubSizes index =
            offset + index * 32 ^ newHeight
        in
          RelaxNode (init numberLessThan32 0 makeSubSizes) (init numberLessThan32 0 makeSubArray)


-- init : Int -> Int -> (Int -> a) -> Table a
-- init size startingIndex func


{-| Creates an array with a given length, filled with a default element.

    repeat 5 0     == fromList [0,0,0,0,0]
    repeat 3 "cat" == fromList ["cat","cat","cat"]

Notice that `repeat 3 x` is the same as `initialize 3 (always x)`.
-}
repeat : Int -> a -> Array a
repeat n e =
  Debug.crash "not yet implemented"


{-| Create an array from a list.
-}
fromList : List a -> Array a
fromList =
  Debug.crash "not yet implemented"


{-| Create a list of elements from an array.

    toList (fromList [3,5,8]) == [3,5,8]
-}
toList : Array a -> List a
toList =
  Debug.crash "not yet implemented"


-- TODO: make this a native function.
{-| Create an indexed list from an array. Each element of the array will be
paired with its index.

    toIndexedList (fromList ["cat","dog"]) == [(0,"cat"), (1,"dog")]
-}
toIndexedList : Array a -> List (Int, a)
toIndexedList array =
  Debug.crash "not yet implemented"


{-| Apply a function on every element in an array.

    map sqrt (fromList [1,4,9]) == fromList [1,2,3]
-}
map : (a -> b) -> Array a -> Array b
map func node =
  case node of
    FullNode height subTrees ->
      FullNode height (Table.map (map func) subTrees)

    RelaxNode heights subTrees ->
      RelaxNode heights (Table.map (map func) subTrees)

    Leaf values ->
      Leaf (Table.map func values)


{-| Apply a function on every element with its index as first argument.

    indexedMap (*) (fromList [5,5,5]) == fromList [0,5,10]
-}
indexedMap : (Int -> a -> b) -> Array a -> Array b
indexedMap =
  Debug.crash "not yet implemented"


{-| Reduce an array from the left. Read `foldl` as &ldquo;fold from the left&rdquo;.

    foldl (::) [] (fromList [1,2,3]) == [3,2,1]
-}
foldl : (a -> b -> b) -> b -> Array a -> b
foldl func acc array =
  case array of
    FullNode _ subTrees ->
      Table.foldl (\subTree newAcc -> foldl func newAcc subTrees) acc subTrees

    RelaxNode _ subTrees ->
      Table.foldl (\subTree newAcc -> foldl func newAcc subTrees) acc subTrees

    Leaf values ->
      Table.foldl func acc values


{-| Reduce an array from the right. Read `foldr` as &ldquo;fold from the right&rdquo;.

    foldr (+) 0 (repeat 3 5) == 15
-}
foldr : (a -> b -> b) -> b -> Array a -> b
foldr func acc array =
  case array of
    FullNode _ subTrees ->
      Table.foldr (\subTree newAcc -> foldr func newAcc subTrees) acc subTrees

    RelaxNode _ subTrees ->
      Table.foldr (\subTree newAcc -> foldr func newAcc subTrees) acc subTrees

    Leaf values ->
      Table.foldr func acc values


{-| Keep only elements that satisfy the predicate:

    filter isEven (fromList [1..6]) == (fromList [2,4,6])
-}
filter : (a -> Bool) -> Array a -> Array a
filter isOkay arr =
  Debug.crash "not yet implemented"


{-| Return an empty array.

    length empty == 0
-}
empty : Array a
empty =
  Debug.crash "not yet implemented"



{-| Push an element to the end of an array.

    push 3 (fromList [1,2]) == fromList [1,2,3]
-}
push : a -> Array a -> Array a
push =
  Debug.crash "not yet implemented"



{-| Return Just the element at the index or Nothing if the index is out of range.

    get  0 (fromList [0,1,2]) == Just 0
    get  2 (fromList [0,1,2]) == Just 2
    get  5 (fromList [0,1,2]) == Nothing
    get -1 (fromList [0,1,2]) == Nothing

-}
get : Int -> Array a -> Maybe a
get i array =
  Debug.crash "not yet implemented"



{-| Set the element at a particular index. Returns an updated array.
If the index is out of range, the array is unaltered.

    set 1 7 (fromList [1,2,3]) == fromList [1,7,3]
-}
set : Int -> a -> Array a -> Array a
set =
  Debug.crash "not yet implemented"



{-| Get a sub-section of an array: `(slice start end array)`. The `start` is a
zero-based index where we will start our slice. The `end` is a zero-based index
that indicates the end of the slice. The slice extracts up to but not including
`end`.

    slice  0  3 (fromList [0,1,2,3,4]) == fromList [0,1,2]
    slice  1  4 (fromList [0,1,2,3,4]) == fromList [1,2,3]

Both the `start` and `end` indexes can be negative, indicating an offset from
the end of the array.

    slice  1 -1 (fromList [0,1,2,3,4]) == fromList [1,2,3]
    slice -2  5 (fromList [0,1,2,3,4]) == fromList [3,4]

This makes it pretty easy to `pop` the last element off of an array: `slice 0 -1 array`
-}
slice : Int -> Int -> Array a -> Array a
slice =
  Debug.crash "not yet implemented"



{-| Return the length of an array.

    length (fromList [1,2,3]) == 3
-}
length : Array a -> Int
length =
  Debug.crash "not yet implemented"


{-| Determine if an array is empty.

    isEmpty empty == True
-}
isEmpty : Array a -> Bool
isEmpty array =
  Debug.crash "not yet implemented"



{-| Append two arrays to a new one.

    append (repeat 2 42) (repeat 3 81) == fromList [42,42,81,81,81]
-}
append : Array a -> Array a -> Array a
append =
  Debug.crash "not yet implemented"
