module Table where

import Native.Table

type Table a = Table


empty : Table a
empty =
  Native.Table.empty

fromList : List a -> Table a
fromList =
  Native.Table.fromList

toList : Table a -> List a
toList table =
  foldr (\x xs -> x::xs) [] table


-- MAPS and FOLDS
-- all can be a for-loop underneath


map : (a -> b) -> Table a -> Table b
map =
  Native.Table.map

indexedMap : (Int -> a -> b) -> Table a -> Table b
indexedMap =
  Native.Table.indexedMap

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


-- CONVERSIONS?


-- toList : Table a -> List a
-- toArray : Table a -> Array a



-- LOOKUP and UPDATE


get : Int -> Table a -> Maybe a
get =
  Native.Table.get

update : List (Int, a -> a) -> Table a -> Table a
update =
  Native.Table.update
