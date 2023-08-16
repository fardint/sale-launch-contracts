import { ethers } from 'hardhat'
import { ParametersStruct } from '../typechain-types/contracts/WESaleFactory'

async function main() {
  //   const WESaleFactory1 = await ethers.getContractAt(
  //     'WESaleFactory',
  //     '0x8ab5971f601087e88a0c3Fd0c12AC5314a10091e'
  //   )
  //   console.log('WESaleFactory1.feeTo', await WESaleFactory1.feeTo())
  //   return
  // avax uniswap v2 router
  // const routerAddress = '0x52B2031Ea4232b68b88e1577206dc388EFcE2E49'
  // Rollux Test
  // const routerAddress = '0x29f7Ad37EC018a9eA97D4b3fEebc573b5635fA84'
  // Rollux
  const routerAddress = '0x0d476148769E4CF5AFFB59e5552cAC8a30D13669'
  const routerZeroAddress = '0x0000000000000000000000000000000000000000'

  // feeTod
  const feeTo = '0x2BEB019cF2F18824c54898308D787aD5d8f2e2Db'
  const signer = '0x39AD2809F73086A63Ab2F0D8D689D1cc02579abA'
  const [owner, founder] = await ethers.getSigners()

  const presaleToken = await ethers.getContractAt(
    'TestERC20',
    '0x4C7Ac2e4AC328BB5162CBB45cC6bEAC910F4d37a'
  )
  const investToken = ethers.utils.getAddress(
    '0x0000000000000000000000000000000000000000'
  )

  const WESaleFactory = await ethers.getContractFactory('WESaleFactory')
  const wesaleFactory = await WESaleFactory.deploy(feeTo, signer)
  await wesaleFactory.deployed()

  console.log(`WESale deployed to ${wesaleFactory.address}`)
  const dexRouterBytes = ethers.utils.id('DEX_ROUTER')
  const dexRouterSetterBytes = ethers.utils.id('DEX_ROUTER_SETTER_ROLE')
  await wesaleFactory.grantRole(dexRouterSetterBytes, owner.address)
  console.log(
    'complete grant routerSetter role to owner: dexRouterSetterBytes: ',
    dexRouterSetterBytes
  )
  await sleep(5000)
  await wesaleFactory.grantRole(dexRouterBytes, routerAddress)
  await wesaleFactory.grantRole(dexRouterBytes, routerZeroAddress)
  console.log(
    'complete grant router role to routerAddress: dexRouterBytes: ',
    dexRouterBytes
  )
  await sleep(5000)

  const startedAt = Math.floor(new Date().getTime() / 1000)
  const endedAt = startedAt + 3600
  const presalePerPrice = ethers.utils.parseUnits('10', 18)
  const presalePerDexInitPrice = ethers.utils.parseUnits('20', 18)
  const sortCap = ethers.utils.parseUnits('0.5', 18)
  const hardCap = ethers.utils.parseUnits('1', 18)
  const minInvest = ethers.utils.parseUnits('0.1', 18)
  const maxInvest = ethers.utils.parseUnits('1', 18)
  const liquidityRate = ethers.BigNumber.from(700000)
  const firstRelease = ethers.BigNumber.from(300000)
  const cycle = ethers.BigNumber.from(60)
  const cycleRelease = ethers.BigNumber.from(200000)
  const parameters: ParametersStruct = {
    price: presalePerPrice,
    liquidityRate: liquidityRate,
    minInvest: minInvest,
    maxInvest: maxInvest,
    softCap: sortCap,
    hardCap: hardCap,
    router: routerAddress,
    dexInitPrice: presalePerDexInitPrice,
    startedAt: ethers.BigNumber.from(startedAt),
    endedAt: ethers.BigNumber.from(endedAt),
    firstRelease: firstRelease,
    cycle: cycle,
    cycleRelease: cycleRelease,
    investTokenDecimals: ethers.BigNumber.from(0),
  }
  const allowPresaleTokenAmount = presalePerPrice
    .mul(hardCap)
    .div(ethers.utils.parseUnits('1', 18))
    .add(
      hardCap
        .mul(liquidityRate)
        .mul(presalePerDexInitPrice)
        .div(1000000)
        .div(ethers.utils.parseUnits('1', 18))
    )
  await presaleToken
    .connect(founder)
    .approve(wesaleFactory.address, allowPresaleTokenAmount)

  //   const tx = await wesaleFactory
  //     .connect(founder)
  //     .createSale(
  //       teamWallet.address,
  //       presaleToken.address,
  //       investTokenA.address,
  //       parameters
  //     )
  const tx = await wesaleFactory
    .connect(founder)
    .createSale(founder.address, presaleToken.address, investToken, parameters)
  console.log(tx)
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
