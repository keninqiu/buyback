var secret = require('./secret.json');
module.exports = {
    "sevenStarProxy": secret.production ? "0x541ce3f716a3d6b64b0da9f51e7fe8ad52294f28" : '0x0449e15d3695023c3ae50e48687b704d3b3e25ce',
    "feeDistribution": secret.production ? "0xf3b46ef452099ec2b6f81644b6da75c91c5e116a" : '0x81dd9357bf85bdb272e9ee1ec0ec2baa8bdffd06',
    "KANBAN": {
        "chain": {
            "name": secret.production ? "mainnet" : "ropsten",
            "hardfork": secret.production ? "petersburg" : "byzantium",
            "networkId": secret.production ? 211 : 212,
            "chainId": secret.production ? 211 : 212
        },
        "gasPrice": 50000000,
        "gasLimit": 20000000
    },
    addresses: {
        smartcontract: {
            USDT: {
                TRX: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
                ETH: secret.production ? '0xdac17f958d2ee523a2206206994597c13d831ec7' : '0x1c35eCBc06ae6061d925A2fC2920779a1896282c'
            },
            EXG: {
                FAB: secret.production ? '0xa3e26671a38978e8204b8a37f1c2897042783b00' : '0x867480ba8e577402fa44f43c33875ce74bdc5df6',
                ETH: secret.production ? '0xebbe2e94b6efd2a09b707167f796ef2616291438' : '0x9cffdbe1bc18c3de44893107b8d2b16d515dbbf7'
            },
            FAB: {
                ETH: secret.production ? '0xf2260ed15c59c9437848afed04645044a8d5e270' : '0xd8b836a7276b3D28FE98CE9d5C8D3041051b792C'
            },
            BST: {
                ETH: secret.production ? '0x4fe1819daf783a3f3151ea0937090063b85d6122' : '0x3732abecb2b660334ea71c029b10494ce9972cfe'
            },
            DSC: {
                ETH: secret.production ? '0xe3d64fca00dd7b76b45f4b8425f49f6e6327623d' : '0x2c4eac82c6aca937c9dc30796f1f8e7f1c04843b'
            },
            DUSD: {
                FAB: secret.production ? '0x46e0021c17d30a2db972ee5719cdc7e829ed9930' : '0x78f6bedc7c3d6500e004c6dca19c8d614cfd91ed'
            },
            DCAD: {
                FAB: secret.production ? '0x39296a9d1c5019fd64c9ef4cd0e657403bf10405' : '0x78f6bedc7c3d6500e004c6dca19c8d614cfd91ed'
            },
            DCNY: {
                FAB: secret.production ? '0xcb856b9d1184232a3ec1ae735b39778c6e65a33a' : '0x78f6bedc7c3d6500e004c6dca19c8d614cfd91ed'
            },
            DJPY: {
                FAB: secret.production ? '0xec794fc70b9db714a4dec2581bce6764b3731a84' : '0x78f6bedc7c3d6500e004c6dca19c8d614cfd91ed'
            },
            DGBP: {
                FAB: secret.production ? '0xb1c07ddae8f2f449e8896874ac307325c39842d3' : '0x78f6bedc7c3d6500e004c6dca19c8d614cfd91ed'
            },
            DEURO: {
                FAB: secret.production ? '0xadf9ec6c2f28217c0c8c8a173e0c06c4e6cbe4a1' : '0x78f6bedc7c3d6500e004c6dca19c8d614cfd91ed'
            },
            DAUD: {
                FAB: secret.production ? '0xbc01e6e46369c6fc61fefa722dd081d1c0f1c096' : '0x78f6bedc7c3d6500e004c6dca19c8d614cfd91ed'
            },
            DMYR: {
                FAB: secret.production ? '0x2a81b44e3c3d0bd3941c636ae3e945460b7ad49d' : '0x78f6bedc7c3d6500e004c6dca19c8d614cfd91ed'
            },
            DKRW: {
                FAB: secret.production ? '0x14221b728caab28eea480fb114b1edd36c72ffaf' : '0x78f6bedc7c3d6500e004c6dca19c8d614cfd91ed'
            },
            DPHP: {
                FAB: secret.production ? '0x4ef2bfe2726b006f6ef85e59555e23c8a7ada071' : '0x78f6bedc7c3d6500e004c6dca19c8d614cfd91ed'
            },
            DTHB: {
                FAB: secret.production ? '0xaf90bd20af338203e807b63417c40eb3cd45ce2e' : '0x78f6bedc7c3d6500e004c6dca19c8d614cfd91ed'
            },
            DTWD: {
                FAB: secret.production ? '0x5b98385998bb78fe55b547c2baa1abc4fd31e4e9' : '0x78f6bedc7c3d6500e004c6dca19c8d614cfd91ed'
            },
            DSGD: {
                FAB: secret.production ? '0xfc32f23a8246d9882149f2aeb2548e9a6da51746' : '0x78f6bedc7c3d6500e004c6dca19c8d614cfd91ed'
            },
            DHKD: {
                FAB: secret.production ? '0x838eac199995a3252bf513bad4b04741767c4331' : '0x78f6bedc7c3d6500e004c6dca19c8d614cfd91ed'
            },
            DINR: {
                FAB: secret.production ? '0x16c3f0a2af0f1661c556f6dd9c4c12843ccedf7a' : '0x78f6bedc7c3d6500e004c6dca19c8d614cfd91ed'
            },
            DMXN: {
                FAB: secret.production ? '0x9b5fe4f9fb3a20d0fc2d2b4533a047994adf51bc' : '0x78f6bedc7c3d6500e004c6dca19c8d614cfd91ed'
            },
            DMXN: {
                FAB: secret.production ? '0x9b5fe4f9fb3a20d0fc2d2b4533a047994adf51bc' : '0x78f6bedc7c3d6500e004c6dca19c8d614cfd91ed'
            },
            DBRL: {
                FAB: secret.production ? '0x0e0eab64b2473a0912ff767904cc013402dfc822' : '0x78f6bedc7c3d6500e004c6dca19c8d614cfd91ed'
            },
            DNGN: {
                FAB: secret.production ? '0xd45948d6cc0450fd97e161fafe973e59a90799c5' : '0x78f6bedc7c3d6500e004c6dca19c8d614cfd91ed'
            }
        },
        exchangilyOfficial: {
            FAB: secret.production ? '1GJ9cTDJM93Y9Ug443nLix7b9wYyPnad55' : 'n3AYguoFtN7SqsfAJPx6Ky8FTTZUkeKbvc',
            BTC: secret.production ? '1GJ9cTDJM93Y9Ug443nLix7b9wYyPnad55' : 'n3AYguoFtN7SqsfAJPx6Ky8FTTZUkeKbvc',
            ETH: secret.production ? '0x4983f8634255762A18D854790E6d35A522E2633a' : '0x450C53c50F8c0413a5829B0A9ab9Fa7e38f3eD2E',
            BCH: secret.production ? 'bitcoincash:qznusftmq4cac0fuj6eyke5vv45njxe6eyafcld37l' : 'bchtest:qrkhd038rw685m0s2kauyquhx0pxlhkvsg6dydtwn9',
            LTC: secret.production ? 'LaX6sfX8RoHbQHNDEBmdzyBMN9vFa95FXL' : 'n3AYguoFtN7SqsfAJPx6Ky8FTTZUkeKbvc',
            DOGE: secret.production ? 'DLSF9i9weYwpgUrendmuGiHC35HGoHuvR9' : 'nqqkf8PqJj3CUjwLMEcjJDfpiU5NDcMUrB',
            TRX: 'TGfvRWxddNoWrghwE5zC1JEcbXyMdPATdo'     
        },
    }
}
