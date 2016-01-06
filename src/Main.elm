module Main where

import Graphics.Element exposing (show)
import Table

main = show
    <| Table.get 1
    <| Table.indexedMap (\i v -> i + 1)
    <| Table.fromList [1, 2, 3]
