import test, {only} from "ava"
import { ADDRESS, ADDRESS2, DATES } from "./constants";
import {ERROR_MESSAGE_ADDRESS_NO_ADDRESS as NO_ADDRESS} from "../src/constants";
import {
    setUpPolly,
    hasProp,
    getNewWeb3DataInstance,
    isISOFormat
} from "./utils";

/**********************************
 * -------- Tests Setup ---------- *
 **********************************/
test.before(t => {
    t.context.polly = setUpPolly('address')
})

test.after(async t => {
    await t.context.polly.stop()
})

test.beforeEach(t => {
    t.context.web3data = getNewWeb3DataInstance()
})

/**********************************
 * -------- Test address -------- *
 **********************************/

/*********** Test getAll() ***********/
test('Successfully calls getAll()', async t => {
    const [addresses] = await t.context.web3data.address.getAll()
    t.true(addresses.hasProp('firstBlockNumber'))
})

test('Successfully calls getAll() - with filters', async t => {
    const [addresses] = await t.context.web3data.address.getAll({type: 'CONTRACT'})
    t.true(addresses.hasProp('type'))
    t.is(addresses.type.toUpperCase(), 'CONTRACT')
    t.true(addresses.creator !== null)
})

/*********** Test getAllAddresses() ***********/
test('Successfully calls getAllAddresses()', async t => {
    const [addresses] = await t.context.web3data.address.getAllAddresses()
    t.true(addresses.hasProp('firstBlockNumber'))
})

test('Successfully calls getAllAddresses() - with filters', async t => {
    const [addresses] = await t.context.web3data.address.getAllAddresses({type: 'CONTRACT'})
    t.true(addresses.hasProp('type'))
    t.is(addresses.type.toUpperCase(), 'CONTRACT')
    t.true(addresses.creator !== null)
})

/*********** Test getInformation() ***********/
test('throws exception when calling getInformation without hash', async t => {
    await t.throwsAsync(async () => {
        await t.context.web3data.address.getInformation()
    }, { instanceOf: Error, message: NO_ADDRESS })
})
test('Successfully gets address information', async t => {
    const info = await t.context.web3data.address.getInformation(ADDRESS)
    t.true(info.hasProp('balance'))
})
test('Successfully gets address information + pricing data', async t => {
    const info = await t.context.web3data.address.getInformation(ADDRESS, {includePrice: true, currency: 'usd'})
    t.true(info.hasProp('balance'))
    t.true(info.hasProp('price'))
    t.true(info.price.balance.hasProp('currency'))
    t.is(info.price.balance.currency, 'usd')
})


/*********** Test getMetadata() ***********/
test('throws exception when calling getMetadata without hash', async t => {
    await t.throwsAsync(async () => {
        await t.context.web3data.address.getMetadata()
    }, { instanceOf: Error, message: NO_ADDRESS })
})

test('Successfully gets address metadata - no filters', async t => {
    const [metadata] = await t.context.web3data.address.getMetadata(ADDRESS)
    t.true(metadata.hasProp('firstSeen'))
})

test('Successfully gets address metadata - with filters', async t => {
    const [metadata] = await t.context.web3data.address.getMetadata(ADDRESS, {timeFormat: 'ms'})
    t.true(metadata.hasProp('firstSeen'))

    /*test that first seen is a number implying that it is in ms*/
    t.regex(`${metadata.firstSeen}`, /[0-9]/)
})

/*********** Test getAdoption() ***********/
test('Successfully calls getAdoption()', async t => {
    const adoption = await t.context.web3data.address.getAdoption(ADDRESS)
    t.true(adoption.hasProp('metadata'))
    t.true(adoption.metadata.hasProp('columns'))
})

test('Successfully calls getAdoption() - with filters', async t => {
    const adoption = await t.context.web3data.address.getAdoption(ADDRESS, {timeFormat: 'iso'})
    t.true(adoption.hasProp('metadata'))
    t.true(adoption.metadata.hasProp('columns'))
    t.true(isISOFormat(adoption.metadata.startDate))
})

test('throws exception when calling getAdoption without hash', async t => {
    await t.throwsAsync(async () => {
        await t.context.web3data.address.getAdoption()
    }, { instanceOf: Error, message: NO_ADDRESS })
})

/*********** Test getInternalMessages() ***********/
test('Successfully gets address internal messages', async t => {
    const [internalMessage] = await t.context.web3data.address.getInternalMessages(ADDRESS)
    t.true(internalMessage.hasProp('depth'))
})

test('throws exception when calling getInternalMessages without hash', async t => {
    await t.throwsAsync(async () => {
        await t.context.web3data.address.getInternalMessages()
    }, { instanceOf: Error, message: NO_ADDRESS })
})

/*********** Test getFunctions() ***********/
test('throws exception when calling getFunctions without hash', async t => {
    await t.throwsAsync(async () => {
        await t.context.web3data.address.getFunctions()
    }, { instanceOf: Error, message: NO_ADDRESS })
})
test('Successfully gets address functions', async t => {
    const [_function] = await t.context.web3data.address.getFunctions(ADDRESS)
    t.true(_function.hasProp('depth'))
})

test('Successfully gets address functions + filters', async t => {
    const [_function] = await t.context.web3data.address.getFunctions(ADDRESS, {validationMethod: 'full'})
    t.true(_function.hasProp('depth'))
    t.true(_function.hasProp('validation'))
})

test('Successfully gets address functions pagination', async t => {
    const SIZE = 5
    const functions = await t.context.web3data.address.getFunctions(ADDRESS, {page: 0, size: SIZE})
    t.is(functions.length, SIZE)
})

/*********** Test getLogs() ***********/
test('throws exception when calling getLogs without hash', async t => {
    await t.throwsAsync(async () => {
        await t.context.web3data.address.getLogs()
    }, { instanceOf: Error, message: NO_ADDRESS })
})

test('Successfully gets address logs - no filters', async t => {
    const [log] = await t.context.web3data.address.getLogs(ADDRESS)
    t.true(log.hasProp('logIndex'))
})

test('Successfully gets address logs - with filters', async t => {
    const BLOCK_NUMBER = '7280571'
    const [log] = await t.context.web3data.address.getLogs(ADDRESS, {blockNumber: BLOCK_NUMBER})
    t.is(log.blockNumber, BLOCK_NUMBER)
})

/*********** Test getTransactions() ***********/
test('throws exception when calling getTransactions without hash', async t => {
    await t.throwsAsync(async () => {
        await t.context.web3data.address.getTransactions()
    }, { instanceOf: Error, message: NO_ADDRESS })
})

test('Successfully gets address transactions - no filters', async t => {
    const [transaction] = await t.context.web3data.address.getTransactions(ADDRESS)
    t.true(transaction.hasProp('fee'))
})

test('Successfully gets address transactions - with filters', async t => {
    const [transaction] = await t.context.web3data.address.getTransactions(ADDRESS2, {includePrice: true})
    t.true(transaction.hasProp('price'))
})

/*********** Test getPendingTransactions() ***********/
test('throws exception when calling getPendingTransactions without hash', async t => {
    await t.throwsAsync(async () => {
        await t.context.web3data.address.getPendingTransactions()
    }, { instanceOf: Error, message: NO_ADDRESS })
})

test.skip('Successfully gets address pending transactions - no filters', async t => {
    const [pendingTxn] = await t.context.web3data.address.getPendingTransactions(ADDRESS2)
    t.true(pendingTxn.hasProp('hash'))
})

test.skip('Successfully gets address pending transactions - with filters', async t => {
    const [pendingTxn] = await t.context.web3data.address.getPendingTransactions(ADDRESS2, {includePrice: true})
    t.true(pendingTxn.hasProp('price'))
})

test.skip('Successfully gets address pending transactions - with pagination', async t => {
    const SIZE = 1
    const pendingTxns = await t.context.web3data.address.getPendingTransactions(ADDRESS2, {page: 0, size: SIZE})
    t.is(pendingTxns.length, SIZE)
})

/*********** Test getTokens() ***********/
test('throws exception when calling getTokens without hash', async t => {
    await t.throwsAsync(async () => {
        await t.context.web3data.address.getTokens()
    }, { instanceOf: Error, message: NO_ADDRESS })
})

test('Successfully gets address tokens - no filters', async t => {
    const [token] = await t.context.web3data.address.getTokens(ADDRESS)
    t.true(token.hasProp('holder'))
})

test('Successfully gets address tokens - with filters', async t => {
    const [token] = await t.context.web3data.address.getTokens(ADDRESS, {includePrice: true})
    t.false(token.hasProp('price'))
})

/*********** Test getTokenTransfers() ***********/
test('throws exception when calling getTokenTransfers without hash', async t => {
    await t.throwsAsync(async () => {
        await t.context.web3data.address.getTokenTransfers()
    }, { instanceOf: Error, message: NO_ADDRESS })
})

test('Successfully gets address token transfers - no filters', async t => {
    const [transfer] = await t.context.web3data.address.getTokenTransfers(ADDRESS)
    t.true(transfer.hasProp('isERC20'))
})

test('Successfully gets address token transfers - with filters', async t => {
    const [transfer] = await t.context.web3data.address.getTokenTransfers(ADDRESS, {includePrice: true , validationMethod: 'basic'})
    t.true(transfer.hasProp('isERC20'))
    t.true(transfer.hasProp('validation'))
})

/*********** Test getTokenBalances() ***********/
test('throws exception when calling getTokenBalances without hash', async t => {
    await t.throwsAsync(async () => {
        await t.context.web3data.address.getTokenBalances()
    }, { instanceOf: Error, message: NO_ADDRESS })
})
test('Successfully gets address token balances', async t => {
    const [balance] = await t.context.web3data.address.getTokenBalances(ADDRESS)
    t.true(balance.hasProp('amount'))
})

test('Successfully gets address token balances - with filters', async t => {
    const balances = await t.context.web3data.address.getTokenBalances(ADDRESS, {size: 2})
    t.is(balances.length, 2)
})

/*********** Test getUsage() ***********/
test('Successfully calls getUsage()', async t => {
    const usage = await t.context.web3data.address.getUsage(ADDRESS)
    t.true(usage.hasProp('metadata'))
})

test('Successfully calls getUsage() - with filters', async t => {
    const usage = await t.context.web3data.address.getUsage(ADDRESS, {timeFormat: 'iso'})
    t.true(usage.hasProp('metadata'))
    t.true(isISOFormat(usage.metadata.startDate))
})

test('throws exception when calling getUsage without hash', async t => {
    await t.throwsAsync(async () => {
        await t.context.web3data.address.getUsage()
    }, { instanceOf: Error, message: NO_ADDRESS })
})

/*********** Test getBalance() ***********/
test('throws exception when calling getBalance without hash', async t => {
    await t.throwsAsync(async () => {
        await t.context.web3data.address.getBalance()
    }, { instanceOf: Error, message: NO_ADDRESS })
})

test('Successfully gets latest address balance (no filters)', async t => {
    const balance = await t.context.web3data.address.getBalance(ADDRESS)
    t.true(balance.hasProp('balanceIn'))
    /* Test that balance is numerical */
    t.regex(balance.balanceIn, /[0-9]/)
})

test('Successfully gets latest address balance (with filters)', async t => {
    // , currency: 'btc'
    const balance = await t.context.web3data.address.getBalance(ADDRESS, {includePrice: true})
    t.true(balance.hasProp('price'))
    /* Test that balance is numerical */
    t.is(balance.price.balance.currency, 'usd')
})

test('Successfully gets historical address balance (no filters)', async t => {
    const histBalance = await t.context.web3data.address.getBalance(ADDRESS, {startDate: DATES["2019-10-14"], endDate: DATES["2019-10-15"]})
    t.true(histBalance.hasProp('data'))
    t.true(Array.isArray(histBalance.data))
})

test('Successfully gets historical address balance (with filters)', async t => {
    const histBalance = await t.context.web3data.address.getBalance(ADDRESS, {startDate: DATES["2019-10-14"], endDate: DATES["2019-10-15"], includePrice: true})
    t.true(histBalance.hasProp('data'))
    t.true(Array.isArray(histBalance.data))
    t.true(histBalance.metadata.columns.includes('price'))
})

test('Successfully gets latest address balance + token balances', async t => {
    const balance = await t.context.web3data.address.getBalance(ADDRESS, {includeTokens: true})
    t.true(balance.hasProp('tokens'))
    /* Test that balance is numerical */
    t.regex(balance.balanceIn, /[0-9]/)
})

test('Successfully gets latest address balance + token balances for multiple addresses', async t => {
    const balances = await t.context.web3data.address.getBalance([ADDRESS, '0xce9af648a831ddf0cd6d05e3fe5787b3c7987246'])
    t.true(balances.hasProp(ADDRESS))
    t.true(balances[ADDRESS].hasProp('tokens'))
    /* Test that balance is numerical */
    t.regex(balances[ADDRESS].balance, /[0-9]/)
})

test('Successfully gets latest address balance + token balances + pricing data for multiple addresses ', async t => {
    const balances = await t.context.web3data.address.getBalance([ADDRESS, '0xce9af648a831ddf0cd6d05e3fe5787b3c7987246'], {includeTokens: true, includePrice: true})
    t.true(balances.hasProp(ADDRESS))
    t.true(balances[ADDRESS].hasProp('price'))
    t.true(balances[ADDRESS].hasProp('tokens'))

    /* Test that balance is numerical */
    t.regex(balances[ADDRESS].balance, /[0-9]/)
})

test('Successfully gets historical address balance + paginates properly', async t => {
    const SIZE = 5
    const balance = await t.context.web3data.address.getBalance(ADDRESS, {startDate: DATES["2019-10-14"], page: 0, size: SIZE})
    t.is(balance.data.length, SIZE)
})

/*********** Test getMetrics() ***********/
test('Successfully calls getMetrics()', async t => {
    const metrics = await t.context.web3data.address.getMetrics(ADDRESS)
    t.true(metrics.hasProp('activeTotal'))
})
