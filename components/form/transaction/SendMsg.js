import { useState } from "react";
import Input from "../../input/Input"
import { isValidAddress } from "../../../libs/checkTool";
import { openNotification } from "../../ulti/Notification";
import { createSendMsg, } from "../../../libs/transaction";
import { convertValueFromDenom } from "../../../libs/stringConvert";
import Button from "../../input/Button";

const SendMsgForm = ({ address, chain, style, msgs, setMsgs }) => {
    const [txBody, setTxBody] = useState({
        toAddress: "",
        amount: 0,
    })
    const [addrError, setAddrError] = useState("")

    const invalidForm = () => {
        for (let key in txBody) {
            if (key === "amount" && txBody[key] === 0) return true
        }
        return false
    }

    const disabled = () => {
        if (invalidForm() || addrError !== "") {
            return true
        }
        return false
    }

    const createMsg = () => {
        try {
            const msg = createSendMsg(
                address,
                txBody.toAddress,
                convertValueFromDenom(chain.base_denom, txBody.amount),
                chain.denom
            )
            setMsgs([...msgs, msg])
            openNotification('success', 'Adding successfully')
        }
        catch (e) {
            alert(e.message)
            openNotification('success', 'Adding unsuccessfully')
        }
    }

    const handleKeyGroupChange = (e) => {
        if(e.target.name === "amount") {
            setTxBody({
                ...txBody,
                [e.target.name]: parseFloat(e.target.value)
            })
        }
        else {
            setTxBody({
                ...txBody,
                [e.target.name]: e.target.value
            })
        }
    }

    const handleKeyBlur = (e) => {
        if (e.target.name === "toAddress" && !isValidAddress(e.target.value, chain.prefix)) {
            setAddrError("Invalid Address")
        }
        else {
            setAddrError("")
        }
    }

    return (
        <div>
            <Input
                onChange={(e) => {
                    handleKeyGroupChange(e);
                }}
                value={txBody.toAddress}
                label="Send To"
                name="toAddress"
                placeholder="Address here"
                error={addrError}
                onBlur={handleKeyBlur}
                style={style.input}
            />
            <Input
                onChange={(e) => {
                    handleKeyGroupChange(e);
                }}
                value={txBody.amount}
                label={`Amount (${chain.denom.substring(1).toUpperCase()})`}
                name="amount"
                type="number"
                placeholder="Amount"
                style={style.input}
            />
            <Button
                text={"Add Message"}
                style={{
                    backgroundColor: disabled() ? "#808080" : "black",
                    color: "white",
                    padding: "1em",
                    width: "100%",
                    borderRadius: "10px",
                    marginTop: "20px",
                    border: 0
                }}
                clickFunction={createMsg}
                disable={disabled()}
            />
        </div>
    )
}

export default SendMsgForm