import test from "ava"
import { getNewWeb3DataInstance } from './constants'
import _ from 'lodash'
import {ERROR_MESSAGE_BLOCK_NO_ID as NO_BLOCK_ID, BLOCKS_ENDPOINT as ENDPOINT} from "../src/constants";

/**********************************
 * -------- Tests Setup ---------- *
 **********************************/

test.beforeEach(t => {
    t.context.web3data = getNewWeb3DataInstance()
})

/**
 * Test that method is called and returns successfully, i.e. a status of 200
 * @param t the test object
 * @param endpoint
 * @param method
 * @param params
 */
const statusSuccess = async (t, { method, params = {} }) => {
    const response = await t.context.web3data.block[method](params.id)
    t.is(response.status, 200)
}
statusSuccess.title = (providedTitle = '', input) =>  `Successfully calls ${input.method} and returns status of 200`

/**
 * Test that method rejects the promise the proper params are not provided
 * @param t the test object
 * @param endpoint
 * @param method
 * @param errorMessage
 */
const rejectsPromise = async (t, { method, params = {} }, errorMessage) => {
    await t.throwsAsync(async () => {
        await t.context.web3data.block[method]()
    }, { instanceOf: Error, message: errorMessage })
}

/* Dynamically creates title based on input */
rejectsPromise.title = (providedTitle = '', input) => `throws exception when calling ${input.method} without number or hash`

const returnsNumber = async (t, { method, params = {} }) => {
    const response = await t.context.web3data.block[method](params.id)
    t.is(typeof response, 'number')
}
returnsNumber.title = (providedTitle = '', input) => `Successfully calls ${input.method} and returns number value`

const returnsNull = async (t, { method, params = {} }) => {
    const response = await t.context.web3data.block[method](999999999)
    t.is(response, null)
}
returnsNull.title = (providedTitle = '', input) => `Successfully calls ${input.method} and returns null value`

const returnsBlockObject = async (t, { method, params = {} }) => {
    const block = await t.context.web3data.block[method](params.id)
    t.is(parseInt(block.number), params.id)
    t.is(typeof block, 'object')
}
returnsBlockObject.title = (providedTitle = '', input) => `Successfully calls ${input.method} and returns valid block object`

const returnsBlockObjectFilters = async (t, { method, params = {} }) => {
    const {id, timeFormat, validationMethod} = params
    const block = await t.context.web3data.block[method](id, {timeFormat, validationMethod})
    t.is(parseInt(block.number), params.id)
    t.true(_.has(block, 'validation'))
    t.is(typeof block, 'object')
}
returnsBlockObjectFilters.title = (providedTitle = '', input) => `Successfully calls ${input.method} with filters returns valid block object`

const returnsUncleObject = async (t, { method, params = {} }) => {
    const uncle = await t.context.web3data.block[method](params.id, params.index)
    t.is(parseInt(uncle.blockNumber), params.id)
    t.is(typeof uncle, 'object')
}
returnsUncleObject.title = (providedTitle = '', input) => `Successfully calls ${input.method} and returns valid uncle object`

// test([statusSuccess, rejectsPromise],  {method: 'getTokenTransfers'}, NO_NUMBER)
test([returnsBlockObject, returnsBlockObjectFilters], {method: 'getBlock', params: {id: 7000000, timeFormat: 'ms', validationMethod: 'full'}})
test([returnsNumber], {method: 'getBlockNumber'})
test([returnsNumber, returnsNull, rejectsPromise], {method: 'getBlockTransactionCount', params: {id: 7000000}}, NO_BLOCK_ID)
test([returnsUncleObject, returnsNull], {method: 'getUncle', params: {id: 8102326, index: 0}})
