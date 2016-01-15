module Table
  ( Table
  , isEmpty
  , empty
  , fromList, toList
  , map, indexedMap
  , foldl, foldr, indexedFoldl, indexedFoldr
  , get, update, updateMany
  )
  where


import Native.Table



type Table a = Table


empty : Table a
empty =
  Native.Table.empty



-- INQUIRIES


isEmpty : Table a -> Bool
isEmpty table =
  empty == table


get : Int -> Table a -> Maybe a
get =
  Native.Table.get


update : Int -> (a -> a) -> Table a -> Table a
update =
  Native.Table.update


updateMany : List (Int, a -> a) -> Table a -> Table a
updateMany =
  Native.Table.updateMany



-- CONVERSIONS


fromList : List a -> Table a
fromList =
  Native.Table.fromList


toList : Table a -> List a
toList table =
  foldr (::) [] table



-- MAPS


map : (a -> b) -> Table a -> Table b
map =
  Native.Table.map


indexedMap : (Int -> a -> b) -> Table a -> Table b
indexedMap =
  Native.Table.indexedMap



-- FOLDS


foldl : (a -> b -> b) -> b -> Table a -> b
foldl =
  Native.Table.foldl

foldr : (a -> b -> b) -> b -> Table a -> b
foldr =
  Native.Table.foldr


indexedFoldl : (Int -> a -> b -> b) -> b -> Table a -> b
indexedFoldl =
  Native.Table.indexedFoldl


indexedFoldr : (Int -> a -> b -> b) -> b -> Table a -> b
indexedFoldr =
  Native.Table.indexedFoldr

