import { useState, useEffect } from "react"
import { pubkeyToAddress } from "@cosmjs/amino"
import { addressShortener } from "../../libs/stringConvert"
import { fromBase64, toBech32 } from "@cosmjs/encoding"
import { rawSecp256k1PubkeyToRawAddress } from "@cosmjs/tendermint-rpc"

const ComponentView = ({ pubkey, index, prefix, chain }) => {
    const [address, setAddress] = useState("")

    useEffect(() => {
        const addrUint8Array = fromBase64(pubkey)
        const rawAddr = rawSecp256k1PubkeyToRawAddress(addrUint8Array)
        const addr = toBech32(prefix, rawAddr)
        setAddress(addr)
    }, [pubkey])

    return (
        <div
            key={index}
            style={{
                backgroundColor: "#dedede",
                borderRadius: "10px",
                textAlign: "center",
                marginBottom: "5px"
            }}
        >
            <a
                href={`${chain.explorer}account/${address}`}
                target={"_blank"}
                rel="noreferrer"
                style={{
                    color: "black"
                }}
            >
                {addressShortener(address)}
            </a>
        </div>
    )
}

export default ComponentView