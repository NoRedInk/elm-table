module Main where

import Graphics.Element exposing (show)
import Table

main = show
    <| Table.toList
    <| Table.indexedMap (\i v -> i + 1)
    <| Table.fromList [1, 2, 3]
