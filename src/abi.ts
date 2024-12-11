export const uniAbi = [
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: "sender", type: "address" },
            { indexed: true, name: "recipient", type: "address" },
            { indexed: false, name: "amount0", type: "int256" },
            { indexed: false, name: "amount1", type: "int256" },
            { indexed: false, name: "sqrtPriceX96", type: "uint160" },
            { indexed: false, name: "liquidity", type: "uint128" },
            { indexed: false, name: "tick", type: "int24" },
        ],
        name: "Swap",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: "owner", type: "address" },
            { indexed: true, name: "tickLower", type: "int24" },
            { indexed: true, name: "tickUpper", type: "int24" },
            { indexed: false, name: "amount", type: "uint128" },
            { indexed: false, name: "amount0", type: "uint256" },
            { indexed: false, name: "amount1", type: "uint256" },
        ],
        name: "Burn",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: "sender", type: "address" },
            { indexed: true, name: "owner", type: "address" },
            { indexed: true, name: "tickLower", type: "int24" },
            { indexed: false, name: "tickUpper", type: "int24" },
            { indexed: false, name: "amount", type: "uint128" },
            { indexed: false, name: "amount0", type: "uint256" },
            { indexed: false, name: "amount1", type: "uint256" },
        ],
        name: "Mint",
        type: "event",
    },
] as const;
