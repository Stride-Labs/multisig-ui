import axios from "axios";

const graphqlReq = axios.create({
    baseURL: "https://graphql.fauna.com/graphql",
    headers: {
        Authorization: `Bearer ${process.env.FAUNADB_SECRET}`,
    },
});

export const createMultisig = async (multisig) => {
    let multisigByAddressMutation = ''

    multisig.components.map((address, index) => {
        const mutation =
            `alias${index}: createMultisigByAddress(
                data: { address: "${multisig.address}", createFrom: "${address}" }
            ) {
                address
            }`
        multisigByAddressMutation = multisigByAddressMutation + mutation + '\n'
    })

    const date = new Date()

    const res = await graphqlReq({
        method: "POST",
        data: {
            query: `
            mutation {
              createMultisig(data: {
                address: "${multisig.address}",
                pubkeyJSON: ${JSON.stringify(multisig.pubkeyJSON)},
                prefix: "${multisig.prefix}"
                createdOn: "${date.toISOString()}"
              }) {
                _id
                address
              }

              ${multisigByAddressMutation}
            }
          `,
        },
    });

    return res
}

export const getMultisigByAddress = async (address) => {
    const res = await graphqlReq({
        method: "POST",
        data: {
            query: `
            query {
                getMultisig(address: "${address.address}") {
                  address
                  pubkeyJSON
                  prefix
                  createdOn
                }
              }
          `
        },
    })
    return res
}

export const getMultisigOfAddress = async (address) => {
    const res = await graphqlReq({
        method: "POST",
        data: {
            query: `
            query{
                getAllMultisigByAddress(
                    createFrom: "${address.address}"
                ) {
                    data {
                      address
                    }
                }
            }
          `
        },
    })
    return res
}

export const createTransaction = async (transaction) => {
    const date = new Date()

    const res = await graphqlReq({
        method: "POST",
        data: {
            query: `
            mutation {
              createTransaction(data: {
                createBy: "${transaction.createBy}",
                dataJSON: ${JSON.stringify(transaction.dataJSON)},
                status: "PENDING"
                createdOn: "${date.toISOString()}"
              }) {
                _id
              }
            }
          `,
        },
    })
    return res
}

export const getTransaction = async (id) => {
    const res = await graphqlReq({
        method: "POST",
        data: {
            query: `
                query {
                    findTransactionByID(id: "${id}") {
                    _id
                    createBy
                    txHash
                    signatures {
                        data {
                        address
                        signature
                        bodyBytes
                        }
                    }
                    dataJSON
                    }
                }
          `,
        },
    })
    return res
}