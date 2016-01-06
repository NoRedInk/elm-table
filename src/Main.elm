module Main where

import Graphics.Element exposing (show)
import Table

type UnboxableType = Unbox Int | Other Int

main = show
    <| Table.update 1
        (\o ->
            case o of
                Unbox v -> Other <| v + 1
                Other v -> Unbox <| v + 2
        )
    <| Table.fromList [Unbox 1, Unbox 2, Unbox 3]
