// import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { createBody, createBodyWithMultipleMessages, createMsgDelegate, createMsgSend, createMsgUndelegate, createMsgBeginRedelegate, createMsgWithdrawDelegatorReward, createMsgVote } from "@evmos/proto";
import {
    createSignerInfo,
    createAuthInfo,
    createFee,
    getPublicKey,
    fromBase64
} from "@injectivelabs/sdk-ts";
import { toBase64 } from "@cosmjs/encoding";
import { coin, coins, makeSignDoc } from "@cosmjs/amino"
import { makeSignDocBeginRedelegateMsg, makeSignDocDelegateMsg, makeSignDocSendMsg, makeSignDocUnDelegateMsg, makeSignDocVoteMsg, makeSignDocWithDrawAllMsg, makeSignDocWithDrawMsg } from "./stringConvert";
const amino_1 = require("@cosmjs/amino");
const encoding_1 = require("@cosmjs/encoding");
const proto_signing_1 = require("@cosmjs/proto-signing");
const multisig_1 = require("cosmjs-types/cosmos/crypto/multisig/v1beta1/multisig");
import * as cosmos_crypto_multisig_v1beta1_multisig_pb from "@injectivelabs/chain-api/cosmos/crypto/multisig/v1beta1/multisig_pb";
import * as cosmos_crypto_multisig_pubkey from "@injectivelabs/chain-api/cosmos/crypto/multisig/keys_pb";
const signing_1 = require("cosmjs-types/cosmos/tx/signing/v1beta1/signing");
const tx_1 = require("cosmjs-types/cosmos/tx/v1beta1/tx");
const tx_2 = require("cosmjs-types/cosmos/tx/v1beta1/tx");
const long_1 = require("long");
const tx_pb_1 = require("@injectivelabs/chain-api/cosmos/tx/v1beta1/tx_pb");
const helpers_1 = require("@injectivelabs/sdk-ts/dist/core/modules/tx/utils/helpers");
const keys_pb_1 = require("@injectivelabs/chain-api/cosmos/crypto/secp256k1/keys_pb");
const keys_pb_2 = require("@injectivelabs/chain-api/cosmos/crypto/secp256k1/keys_pb");
import { TxRaw } from '@injectivelabs/chain-api/cosmos/tx/v1beta1/tx_pb';

export const evmTypeSign = async (msgs, memo, chainId, signer, multisigAcc, pubkey, gas, fee, denom) => {
    const formatMsgs = msgs.map(msg => {
        let newMsg
        switch (msg.typeUrl) {
            case "/cosmos.bank.v1beta1.MsgSend":
                newMsg = createMsgSend(msg.value.fromAddress, msg.value.toAddress, msg.value.amount[0].amount, msg.value.amount[0].denom)
                break
            case "/cosmos.staking.v1beta1.MsgDelegate":
                newMsg = createMsgDelegate(msg.value.delegatorAddress, msg.value.validatorAddress, msg.value.amount.amount, msg.value.amount.denom)
                break
            case "/cosmos.staking.v1beta1.MsgUndelegate":
                newMsg = createMsgUndelegate(msg.value.delegatorAddress, msg.value.validatorAddress, msg.value.amount.amount, msg.value.amount.denom)
                break
            case "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward":
                newMsg = createMsgWithdrawDelegatorReward(msg.value.delegatorAddress, msg.value.validatorAddress)
                break
            case "/cosmos.staking.v1beta1.MsgBeginRedelegate":
                newMsg = createMsgBeginRedelegate(msg.value.delegatorAddress, msg.value.validatorSrcAddress, msg.value.validatorDstAddress, msg.value.amount.amount, msg.value.amount.denom)
                break
            case "/cosmos.gov.v1beta1.MsgVote":
                newMsg = createMsgVote(msg.value.proposalId, msg.value.option, msg.value.voter)
                break
        }
        return newMsg
    })

    const formatAminoMsgs = msgs.map(msg => {
        let newMsg
        switch (msg.typeUrl) {
            case "/cosmos.bank.v1beta1.MsgSend":
                newMsg = makeSignDocSendMsg(msg.value.fromAddress, msg.value.toAddress, msg.value.amount[0].amount, msg.value.amount[0].denom)
                break
            case "/cosmos.staking.v1beta1.MsgDelegate":
                newMsg = makeSignDocDelegateMsg(msg.value.delegatorAddress, msg.value.validatorAddress, msg.value.amount.amount, msg.value.amount.denom)
                break
            case "/cosmos.staking.v1beta1.MsgUndelegate":
                newMsg = makeSignDocUnDelegateMsg(msg.value.delegatorAddress, msg.value.validatorAddress, msg.value.amount.amount, msg.value.amount.denom)
                break
            case "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward":
                newMsg = makeSignDocWithDrawMsg(msg.value.delegatorAddress, msg.value.validatorAddress)
                break
            case "/cosmos.staking.v1beta1.MsgBeginRedelegate":
                newMsg = makeSignDocBeginRedelegateMsg(msg.value.delegatorAddress, msg.value.validatorSrcAddress, msg.value.validatorDstAddress, msg.value.amount.amount, msg.value.amount.denom)
                break
            case "/cosmos.gov.v1beta1.MsgVote":
                newMsg = makeSignDocVoteMsg(msg.value.option, msg.value.proposalId, msg.value.voter)
                break
        }
        return newMsg
    })

    const body = createBodyWithMultipleMessages(formatMsgs, memo);

    // --------------------------------------NOT TOUCH ------------------------------------------------------//

    const signDoc = makeSignDoc(formatAminoMsgs, {
        amount: coins(fee, denom),
        gas: gas,
    }, chainId, memo, multisigAcc.account_number, multisigAcc.sequence)
    // let sign = await window?.keplr?.signAmino(
    //     chainId,
    //     signer.bech32Address,
    //     {
    //         bodyBytes: body.serializeBinary(),
    //         authInfoBytes: authInfo.serializeBinary(),
    //         chainId: chainId,
    //         accountNumber: multisigAcc.account_number,
    //     },
    //     // @ts-expect-error the types are not updated on Keplr side
    //     { isEthereum: true }
    // );

    let sign = await window?.keplr?.signAmino(
        chainId,
        signer.bech32Address,
        signDoc,
        // @ts-expect-error the types are not updated on Keplr side
        { isEthereum: true }
    );

    return {
        bodyBytes: body.serializeBinary(),
        signatures: [
            new Uint8Array(Buffer.from(sign.signature.signature, "base64")),
        ],
    }
}

function makeCompactBitArray(bits) {
    let obj = new cosmos_crypto_multisig_v1beta1_multisig_pb.CompactBitArray()
    const byteCount = Math.ceil(bits.length / 8);
    const extraBits = bits.length - Math.floor(bits.length / 8) * 8;
    const bytes = new Uint8Array(byteCount); // zero-filled
    bits.forEach((value, index) => {
        const bytePos = Math.floor(index / 8);
        const bitPos = index % 8;
        // eslint-disable-next-line no-bitwise
        if (value)
            bytes[bytePos] |= 0b1 << (8 - 1 - bitPos);
    });
    obj.setExtraBitsStored(extraBits)
    obj.setElems(bytes)
    return obj
}

const createSignerInfoMod = ({ chainId, publicKey, sequence, mode, }) => {
    const pubKey = (0, getPublicKey)({ chainId, key: publicKey });
    const multi = new tx_pb_1.ModeInfo.Multi();
    let modeInfoList = []
    for (let i = 0; i < mode.multi.modeInfos.length; i++){
        const modeInfoSingle = new tx_pb_1.ModeInfo();
        const singleObj = new tx_pb_1.ModeInfo.Single();
        singleObj.setMode(mode.multi.modeInfos[i].single.mode);
        modeInfoSingle.setSingle(singleObj);
        modeInfoList.push(modeInfoSingle)
    }
    multi.setModeInfosList(modeInfoList);
    multi.setBitarray(mode.multi.bitarray)
    const modeInfo = new tx_pb_1.ModeInfo();
    modeInfo.setMulti(multi);
    const signerInfo = new tx_pb_1.SignerInfo();
    signerInfo.setPublicKey(pubKey);
    signerInfo.setSequence(parseInt(sequence));
    signerInfo.setModeInfo(modeInfo);
    console.log(signerInfo.toObject())
    return signerInfo;
};

export function makeMultisignedTx(multisigPubkey, sequence, fee, bodyBytes, signatures, addressList, chainId) {
    const signers = Array(multisigPubkey.value.pubkeys.length).fill(false);
    const signaturesList = new Array();
    for (let i = 0; i < multisigPubkey.value.pubkeys.length; i++) {
        const signerAddress = addressList[i]
        const signature = signatures.get(signerAddress);
        if (signature) {
            signers[i] = true;
            signaturesList.push(signature);
        }
    }
    const pubkeysList = multisigPubkey.value.pubkeys.map((pubkey) => {
        let proto;
        let path;
        proto = new keys_pb_1.PubKey();
        if (chainId.startsWith('injective')) {
            proto = new keys_pb_1.PubKey();
            path = '/injective.crypto.v1beta1.ethsecp256k1.PubKey';
        }
        else if (chainId.startsWith('evmos')) {
            proto = new keys_pb_1.PubKey();
            path = '/ethermint.crypto.v1.ethsecp256k1.PubKey';
        }
        else {
            proto = new keys_pb_2.PubKey();
            path = '/cosmos.crypto.secp256k1.PubKey';
        }
        proto.setKey(Buffer.from(pubkey.value, 'base64'));
        return (0, helpers_1.createAny)(proto.serializeBinary(), path);
    })

    const multisigPk = new cosmos_crypto_multisig_pubkey.LegacyAminoPubKey()
    multisigPk.setThreshold(multisigPubkey.value.threshold)
    multisigPk.setPublicKeysList(pubkeysList)
    // let pub = (0, proto_signing_1.encodePubkey)(multisigPubkey)

    const signerInfo = createSignerInfoMod({
        chainId: chainId,
        publicKey: toBase64(multisigPk.serializeBinary()),
        sequence: sequence,
        mode: {
            multi: {
                bitarray: makeCompactBitArray(signers),
                modeInfos: signaturesList.map((_) => ({ single: { mode: 127 } })),
            },
        },
    })

    // const signerInfo = {
    //     publicKey: (0, proto_signing_1.encodePubkey)(multisigPubkey),
    //     modeInfo: {
    //         multi: {
    //             bitarray: makeCompactBitArray(signers),
    //             modeInfos: signaturesList.map((_) => ({ single: { mode: signing_1.SignMode.SIGN_MODE_LEGACY_AMINO_JSON } })),
    //         },
    //     },
    //     sequence: long_1.fromNumber(sequence),
    // };

    console.log(signerInfo)

    const authInfo = createAuthInfo({
        signerInfo: [signerInfo],
        fee: createFee({
            fee: {
                amount: fee.amount[0].amount,
                denom: fee.amount[0].denom,
            },
            payer: null,
            gasLimit: parseInt(fee.gas),
        }),
    });

    // const authInfo = tx_1.AuthInfo.fromPartial({
    //     signerInfos: [signerInfo],
    //     fee: {
    //         amount: [...fee.amount],
    //         gasLimit: long_1.fromString(fee.gas),
    //     },
    // });
    // const authInfoBytes = tx_1.AuthInfo.encode(authInfo).finish();
    // const signedTx = tx_2.TxRaw.fromPartial({
    //     bodyBytes: bodyBytes,
    //     authInfoBytes: authInfoBytes,
    //     signatures: [multisig_1.MultiSignature.encode(multisig_1.MultiSignature.fromPartial({ signatures: signaturesList })).finish()],
    // });
    // return signedTx;

    const multisigObj = new cosmos_crypto_multisig_v1beta1_multisig_pb.MultiSignature()

    multisigObj.setSignaturesList(signaturesList)

    const txRaw = new TxRaw()

    txRaw.setAuthInfoBytes(authInfo.serializeBinary())
    txRaw.setBodyBytes(bodyBytes)
    txRaw.setSignaturesList([multisigObj.serializeBinary()])

    // let marshalTx = Uint8Array.from(
    //     TxRaw.encode({
    //         bodyBytes: bodyBytes,
    //         authInfoBytes: authInfo.serializeBinary(),
    //         signatures: multisigObj.serializeBinary(),
    //     }).finish())

    return txRaw.serializeBinary()
}