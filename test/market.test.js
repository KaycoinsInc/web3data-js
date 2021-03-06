import test from 'ava'
import {
  TOKEN_ADDRESS, DATES
} from "./constants";
import { setUpPolly, isISOFormat, getNewWeb3DataInstance } from "./utils";
import { ERROR_MESSAGE_MARKET_NO_PAIR as NO_PAIR, MARKET_FEATURES } from "../src/constants";

/***********************************
 * -------- Tests Setup ---------- *
 **********************************/
test.before(t => {
  t.context.polly = setUpPolly('market')
})

test.after(async t => {
  await t.context.polly.stop()
})

test.beforeEach(t => {
  t.context.web3data = getNewWeb3DataInstance()
});



/*********************************
 * ----------- Tests ----------- *
 *********************************/

/*********** Test getEtherPrice() ***********/
test('Successfully gets ether price', async t => {
  const etherPrice = await t.context.web3data.market.getEtherPrice()
  t.regex(etherPrice, /\d+\.?\d*/)
})

/*********** Test getRankings() ***********/
test('Successfully gets market rankings', async t => {
  const rankings = await t.context.web3data.market.getRankings()
  t.true(rankings.hasProp('data'))
  t.true(Array.isArray(rankings.data))
  t.true(rankings.data[0].hasProp('changeInPriceDaily'))
  t.regex(rankings.data[0].changeInPriceDaily, /\d+\.?\d*/)
})

test('Successfully gets market rankings - with filters', async t => {
  const rankings = await t.context.web3data.market.getRankings({ sortType: 'uniqueAddresses' })
  t.true(rankings.hasProp('data'))
  t.true(Array.isArray(rankings.data))
  t.regex(rankings.data[0].changeInPriceDaily, /\d+\.?\d*/)
})

/*********** Test getFeatures() ***********/
test('Successfully gets market features - all', async t => {
  const features = await t.context.web3data.market.getFeatures()
  // Check each features name spacing
  MARKET_FEATURES.forEach(feature => t.true(features.hasProp(feature)))
})

test('Successfully gets market features - single string param', async t => {
  const features = await t.context.web3data.market.getFeatures('pairs')

  // Test namespace
  t.true(features.hasProp('pairs'))

  // Test that it's correct data
  t.true(features.pairs.hasProp('btc_eur'))
})

test('Successfully gets market features - array param', async t => {
  const features = await t.context.web3data.market.getFeatures(['pairs', 'tickers'])

  // Check that it only returned 2 features
  t.is(Object.values(features).length, 2)

  // Check namespace exist
  t.true(features.hasProp('pairs'))
  t.true(features.hasProp('tickers'))

  // Test that it's correct data
  t.true(features.pairs.hasProp('btc_eur'))
  t.true(features.tickers.hasProp('gdax'))
  t.true(features.tickers.gdax.hasProp('btc_usd'))
})

test('Successfully gets market features - with filters', async t => {
  const features = await t.context.web3data.market.getFeatures('ohlcv', { exchange: 'gdax' })
  t.true(features.hasProp('ohlcv'))

  // Check that filtered exchange exists
  t.true(features.ohlcv.hasProp('gdax'))

  // Check that it only returned a singe exchange
  t.is(features.ohlcv.values().length, 1)
})

/*********** Test getOhlcv() ***********/
test('Successfully gets latest ohlcv', async t => {
  const ohlcv = await t.context.web3data.market.getOhlcv('eth_btc')
  t.true(ohlcv.values()[0].hasProp('open'))
  t.regex(ohlcv.values()[0].open.toString(), /\d+\.?\d*/)
})

test('Successfully gets latest ohlcv - with filters', async t => {
  const ohlcv = await t.context.web3data.market.getOhlcv('eth_btc', { exchange: 'bitfinex' })
  t.is(ohlcv.values().length, 1)
  t.true(ohlcv.hasProp('bitfinex'))
  t.true(ohlcv.bitfinex.hasProp('open'))
  t.regex(ohlcv.bitfinex.open.toString(), /\d+\.?\d*/)
})

test('Successfully gets historical ohlcv', async t => {
  const ohlcv = await t.context.web3data.market.getOhlcv('eth_btc', { startDate: DATES["2019-10-14"], endDate: DATES["2019-10-15"] })
  t.true(ohlcv.hasProp('metadata'))
  t.regex(Object.values(ohlcv.data)[0].toString(), /\d+\.?\d*/)
})

test('throws exception when calling getOhlcv without pair param', async t => {
  await t.throwsAsync(async () => {
    await t.context.web3data.market.getOrders()
  }, { instanceOf: Error, message: NO_PAIR })
})

/*********** Test getOrders() ***********/
test('Successfully gets latest orders', async t => {
  const orders = await t.context.web3data.market.getOrders('eth_btc', 'gdx')
  t.true(orders.hasProp('metadata'))
  t.true(orders.hasProp('data'))
  t.true(orders.data.hasProp('ask'))
})

test('Successfully gets latest orders - multi-exchange', async t => {
  const orders = await t.context.web3data.market.getOrders('eth_btc', ['gdx', 'bitstamp'])
  t.true(orders.hasProp('metadata'))
  t.true(orders.hasProp('data'))
  t.true(orders.data.hasProp('ask'))
})

test('Successfully gets orders - with filters', async t => {
  const orders = await t.context.web3data.market.getOrders('eth_btc', 'gdx', {
    timeFormat: 'iso'
  })
  t.true(orders.hasProp('metadata'))
  t.true(orders.hasProp('data'))
  t.true(orders.data.hasProp('ask'))
  t.true(isISOFormat(orders.metadata.requestedTimestamp))
})

test('throws exception when calling getOrders without pair param', async t => {
  await t.throwsAsync(async () => {
    await t.context.web3data.market.getOrders()
  }, { instanceOf: Error, message: NO_PAIR })
})

test('throws exception when calling getOrders without exchange param', async t => {
  await t.throwsAsync(async () => {
    await t.context.web3data.market.getOrders('eth_btc')
  }, { instanceOf: Error, message: 'No exchange specified' })
})

/*********** Test getBbos() ***********/
test.skip('Successfully gets latest bbos', async t => {
  const bbos = await t.context.web3data.market.getBbos('eth_btc')
  const exchangePairBbo = Object.values(Object.values(bbos))[0]

  t.true(exchangePairBbo.hasProp('price'))
})
test('Successfully gets historical bbos', async t => {
  const bbos = await t.context.web3data.market.getBbos('eth_btc', { startDate: 1583708400000, endDate: 1583712000000 })

  // Check existence of historical data properties
  t.true(bbos.hasProp('metadata'))
  t.true(bbos.hasProp('data'))
  t.true(Array.isArray(bbos.data))
})

test('throws exception when calling getBbos without pair param', async t => {
  await t.throwsAsync(async () => {
    await t.context.web3data.market.getBbos()
  }, { instanceOf: Error, message: NO_PAIR })
})

/*********** Test getPrices() ***********/
const BASE = 'eth'
test('Successfully gets latest market prices', async t => {
  const prices = await t.context.web3data.market.getPrices(`${BASE}_usd`)
  t.true(prices.hasProp('price'))
  t.true(prices.hasProp('volume'))

  // Test the there is a price property that has a float value
  t.regex(prices.price.toString(), /\d+\.?\d*/)
})

test('Successfully gets latest market prices - with filters', async t => {
  const prices = await t.context.web3data.market.getPrices(`${BASE}_eur`)
  t.true(prices.hasProp('price'))
  t.true(prices.hasProp('volume'))

  // Test the there is a price property that has a float value
  t.regex(prices.price.toString(), /\d+\.?\d*/)
})

test('Successfully gets historical market prices', async t => {
  const prices = await t.context.web3data.market.getPrices(`${BASE}_usd`, { startDate: DATES["2019-10-14"], endDate: DATES["2019-10-15"] })
  t.true(Array.isArray(prices.data))
  t.true(prices.data[0].hasProp('price'))

  // Test there is a price property that has a float value
  t.regex(prices.data[0].price.toString(), /\d+\.?\d*/)
})

test('throws exception when calling getPrices without base param', async t => {
  await t.throwsAsync(async () => {
    await t.context.web3data.market.getPrices()
  }, { instanceOf: Error, message: NO_PAIR })
})

/*********** Test getTokenPrices() ***********/
test('Successfully gets current token price', async t => {
  const tokenPrices = (await t.context.web3data.market.getTokenPrices(TOKEN_ADDRESS))[0]
  t.true(tokenPrices.hasProp('address'))
  t.is(tokenPrices.address, TOKEN_ADDRESS)
})

test('Successfully gets historical token price', async t => {
  const tokenPrices = await t.context.web3data.market.getTokenPrices(TOKEN_ADDRESS, { startDate: DATES["2019-10-14"], endDate: DATES["2019-10-15"] })
  t.true(tokenPrices.hasProp('metadata'))
  t.true(tokenPrices.hasProp('data'))
  t.true(tokenPrices.metadata.columns.includes('priceUSD'))
})

test('throws exception when calling getTokenPrices without pair param', async t => {
  await t.throwsAsync(async () => {
    await t.context.web3data.market.getTokenPrices()
  }, { instanceOf: Error, message: NO_PAIR })
})

/*********** Test getVwap() ***********/
test('Successfully gets current vwap prices', async t => {
  const vwap = await t.context.web3data.market.getVwap('eth')
  t.true(vwap.hasProp('eth_btc'))
  t.true(vwap.eth_btc.hasProp('twap1m'))
})

test('Successfully gets current vwap prices - with filters', async t => {
  const vwap = await t.context.web3data.market.getVwap('eth', { quote: 'usd' })

  // check that it returns data for a single pair
  t.is(Object.keys(vwap).length, 1)
  t.true(vwap.hasProp('eth_usd'))
  t.true(vwap.eth_usd.hasProp('twap1m'))
})

test('throws exception when calling getVwap without base param', async t => {
  await t.throwsAsync(async () => {
    await t.context.web3data.market.getVwap()
  }, { instanceOf: Error, message: NO_PAIR })
})

/*********** Test getTickers() ***********/
test('Successfully gets latest market tickers', async t => {
  const tickers = await t.context.web3data.market.getTickers('eth_btc')
  t.true(tickers.hasProp('gdax'))
  t.true(tickers.gdax.hasProp('bid'))
})

test('Successfully gets latest market tickers - with filters', async t => {
  const tickers = await t.context.web3data.market.getTickers('eth_btc', { exchange: 'gdax' })
  // check that it returns data for a single exchange
  t.is(Object.keys(tickers).length, 1)
  t.true(tickers.hasProp('gdax'))
  t.true(tickers.gdax.hasProp('bid'))
})

test('Successfully gets historical market tickers', async t => {
  const tickers = await t.context.web3data.market.getTickers('eth_btc', { startDate: DATES["2019-10-14"], endDate: DATES["2019-10-15"] })
  t.true(tickers.hasProp('metadata'))
  t.true(tickers.hasProp('data'))
  t.true(tickers.metadata.columns.includes('bid'))
})

test('throws exception when calling getTickers without pair param', async t => {
  await t.throwsAsync(async () => {
    await t.context.web3data.market.getTickers()
  }, { instanceOf: Error, message: NO_PAIR })
})

/*********** Test getTrades() ***********/
test('Successfully gets market trades', async t => {
  const trades = await t.context.web3data.market.getTrades('eth_usd')
  t.true(trades.hasProp('metadata'))
  t.true(trades.hasProp('data'))
  t.true(trades.metadata.columns.includes('price'))
})

test('Successfully gets market trades - with filters', async t => {
  const trades = await t.context.web3data.market.getTrades('eth_usd', { exchange: 'bitstamp' })
  t.true(trades.hasProp('metadata'))
  t.true(trades.hasProp('data'))
  t.true(trades.data[0].includes('bitstamp'))
})

test('throws exception when calling getTrades without pair param', async t => {
  await t.throwsAsync(async () => {
    await t.context.web3data.market.getTrades()
  }, { instanceOf: Error, message: NO_PAIR })
})

/*********** Test getOrderBooks() ***********/
test('Successfully gets order book updates', async t => {
  const orderBooks = await t.context.web3data.market.getOrderBooks('btc_usd', { exchange: 'gdax' })
  t.true(orderBooks.hasProp('data'))
  t.true(orderBooks.hasProp('metadata'))
  t.true(orderBooks.metadata.columns.includes('numOrders'))
})

test('Successfully gets order book updates - with filters', async t => {
  const orderBooks = await t.context.web3data.market.getOrderBooks('btc_usd', { exchange: 'gdax' })
  t.true(orderBooks.hasProp('data'))
  t.true(orderBooks.hasProp('metadata'))
  t.true(orderBooks.metadata.columns.includes('numOrders'))
  // t.true(`${orderBooks.data}`.search('gdax') !== -1)
})

test('throws exception when calling getOrderBooks without pair param', async t => {
  await t.throwsAsync(async () => {
    await t.context.web3data.market.getOrderBooks()
  }, { instanceOf: Error, message: NO_PAIR })
})
/*********** Test getAssetAddresses() ***********/
test('Successfully gets single asset address', async t => {
  const batTokenAddress = await t.context.web3data.market.getAssetAddresses('bat')
  t.true(batTokenAddress.hasProp('bat'))
  t.regex(batTokenAddress.bat, /^0x[a-fA-F0-9]{40}$/g)
})

test('Successfully gets multiple asset addresses', async t => {
  const assetAddresses = await t.context.web3data.market.getAssetAddresses(['bat', 'rep'])
  t.true(assetAddresses.hasProp('bat'))
  t.true(assetAddresses.hasProp('rep'))
  t.is(assetAddresses.values().length, 2)
  t.regex(assetAddresses.bat, /^0x[a-fA-F0-9]{40}$/g)
  t.regex(assetAddresses.rep, /^0x[a-fA-F0-9]{40}$/g)
})
