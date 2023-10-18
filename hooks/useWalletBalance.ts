import { useQuery } from '@tanstack/react-query'
import { useWallet } from '@txnlab/use-wallet'
import { useEffect, useState } from 'react'
import algodClient from 'lib/algodClient'
import { formatAssetBalance } from 'utils'

export default function useWalletBalance() {
  const [walletBalance, setWalletBalance] = useState<string | null>(null)
  const [walletAvailableBalance, setWalletAvailableBalance] = useState<string | null>(null)
  const [assetList, setAssetList] = useState<any | null>(null)
  const [createdAssets, setCreatedAssets] = useState<any | null>(null)
  const [expBal, setExpBal] = useState<any>(-1)
  const [orderBal, setOrderBal] = useState<any>(-1)
  const [boostBal, setBoostBal] = useState<any>(-1)
  const [oakLogsBal, setOakLogsBal] = useState<any>(-1)
  const [clayOreBal, setClayOreBal] = useState<any>(-1)

  const { activeAccount } = useWallet()

  const getAccountInfo = async () => {
    if (!activeAccount) throw new Error('No selected account.')
    const accountInfo = await algodClient.accountInformation(activeAccount.address).do()
    return accountInfo
  }

  const { data: accountInfo } = useQuery(['balance', activeAccount?.address], getAccountInfo, {
    enabled: !!activeAccount?.address,
    refetchInterval: 30000
  })

  useEffect(() => {
    if (activeAccount && accountInfo && accountInfo.amount !== undefined && accountInfo['min-balance'] !== undefined) {
      const balance = formatAssetBalance(accountInfo.amount, 6, true, true, 8)
      const availableBalance = formatAssetBalance(accountInfo.amount - accountInfo['min-balance'], 6, true, true, 8)
      const assets = accountInfo.assets.filter((item: any) => item.amount > 0)
      assets.reverse()
      const expInfo = assets.find((asset: any) => asset['asset-id'] === 811721471)
      setExpBal(expInfo ? formatAssetBalance(expInfo.amount, 0, true, true, 3) : -1)
      const orderInfo = assets.find((asset: any) => asset['asset-id'] === 811718424)
      setOrderBal(orderInfo ? formatAssetBalance(orderInfo.amount, 0, true, true, 3) : -1)
      const boostInfo = assets.find((asset: any) => asset['asset-id'] === 815771120)
      setBoostBal(boostInfo ? formatAssetBalance(boostInfo.amount, 0, true, true, 3) : -1)
      const oakLogsInfo = assets.find((asset: any) => asset['asset-id'] === 1064863037)
      setOakLogsBal(oakLogsInfo ? formatAssetBalance(oakLogsInfo.amount, 0, true, true, 3) : -1)
      const clayOreInfo = assets.find((asset: any) => asset['asset-id'] === 1167832686)
      setClayOreBal(clayOreInfo ? formatAssetBalance(clayOreInfo.amount, 0, true, true, 3) : -1)
      const created = accountInfo['created-assets']
      created.reverse()
      setAssetList(assets)
      setCreatedAssets(created)
      setWalletBalance(balance)
      setWalletAvailableBalance(availableBalance)
    } else {
      setAssetList([])
      setCreatedAssets([])
      setWalletBalance('0.000')
      setWalletAvailableBalance('0.000')
    }
  }, [accountInfo, walletBalance, walletAvailableBalance])

  return {
    accountInfo,
    assetList,
    createdAssets,
    walletBalance,
    walletAvailableBalance,
    expBal,
    orderBal,
    boostBal,
    oakLogsBal,
    clayOreBal
  }
}