import { describe, beforeAll, beforeEach, test, expect } from '@jest/globals';
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing';
import * as algokit from '@algorandfoundation/algokit-utils';
import algosdk, { makePaymentTxnWithSuggestedParamsFromObject } from 'algosdk';
import { getOrCreateKmdWalletAccount } from '@algorandfoundation/algokit-utils';
import { DeFundItClient } from '../contracts/clients/DeFundItClient';

const fixture = algorandFixture();
algokit.Config.configure({ populateAppCallResources: true });

let appClient: DeFundItClient;

let beneficiaryAddress: string;
let secondSender: algosdk.Account;
let algorand: algokit.AlgorandClient;

describe('DeFundIt', () => {
  beforeEach(fixture.beforeEach);

  beforeAll(async () => {
    await fixture.beforeEach();
    const { testAccount: creator, algod, kmd } = fixture.context;
    const { algorand: client } = fixture;

    algorand = client;

    // Create a new sender account
    secondSender = await getOrCreateKmdWalletAccount(
      {
        name: 'secondSender',
        fundWith: algokit.algos(200),
      },
      algod,
      kmd
    );

    appClient = new DeFundItClient(
      {
        sender: creator,
        resolveBy: 'id',
        id: 0,
      },
      algorand.client.algod
    );

    beneficiaryAddress = creator.addr;

    // Create the DeFundIt application with the beneficiary address
    await appClient.create.createApplication({ addr: beneficiaryAddress });
  });

  // Deposit funds into the smart contract
  test('deposit', async () => {
    const result = await appClient.appClient.fundAppAccount({ amount: algokit.microAlgos(200_000) });

    expect(result.confirmation).toBeDefined();
  });

  // Confirm that the Beneficiary account matches the creator account
  test('confirmBeneficiaryAddress', async () => {
    const addr = await appClient.getBeneficiaryAddress({});

    expect(beneficiaryAddress).toEqual(addr.return!.valueOf());
  });

  // Send funds to the beneficiary account
  test('sendFundingRequest', async () => {
    const { appAddress } = await appClient.appClient.getAppReference();
    const { algod } = fixture.context;

    const txn = makePaymentTxnWithSuggestedParamsFromObject({
      from: secondSender.addr,
      to: appAddress,
      amount: 1n,
      suggestedParams: await algokit.getTransactionParams(undefined, algod),
    });

    const result = await appClient.sendFunding(
      { senderTxn: txn },
      {
        sender: secondSender,
        sendParams: {
          fee: algokit.algos(0.002),
        },
      }
    );
    expect(result.confirmation).toBeDefined();

    const fundValue = (await appClient.getGlobalState()).funds!.asBigInt();
    expect(fundValue).toBe(1n);
  });

  // Send funds to the beneficiary account again, this time with a higher amount
  test('sendFundingRequestTwo', async () => {
    const { appAddress } = await appClient.appClient.getAppReference();
    const { algod } = fixture.context;

    const thirdSender = await algorand.account.kmd.getOrCreateWalletAccount('testWalet2');

    const txn = makePaymentTxnWithSuggestedParamsFromObject({
      from: thirdSender.addr,
      to: appAddress,
      amount: 500n,
      suggestedParams: await algokit.getTransactionParams(undefined, algod),
    });

    const result = await appClient.sendFunding(
      { senderTxn: txn },
      {
        sender: thirdSender,
        sendParams: {
          fee: algokit.algos(0.002),
        },
      }
    );
    expect(result.confirmation).toBeDefined();

    const fundValue = (await appClient.getGlobalState()).funds!.asBigInt();
    expect(fundValue).toBe(501n);
  });

  // Send funds to the beneficiary account with a very high amount, to check the limit of funds
  test('sendFundingRequestThree', async () => {
    const { appAddress } = await appClient.appClient.getAppReference();
    const { algod } = fixture.context;

    const fourthSender = await algorand.account.kmd.getOrCreateWalletAccount('testWalet2');

    const txn = makePaymentTxnWithSuggestedParamsFromObject({
      from: fourthSender.addr,
      to: appAddress,
      amount: 9999499n,
      suggestedParams: await algokit.getTransactionParams(undefined, algod),
    });

    const result = await appClient.sendFunding(
      { senderTxn: txn },
      {
        sender: fourthSender,
        sendParams: {
          fee: algokit.algos(0.002),
        },
      }
    );
    expect(result.confirmation).toBeDefined();

    const fundValue = (await appClient.getGlobalState()).funds!.asBigInt();
    expect(fundValue).toBe(10000000n);
  });

  // Check and Senf the funds to the beneficiary account if funding target is met
  test('checkAndSendFunds', async () => {
    const { appAddress } = await appClient.appClient.getAppReference();

    const result = await appClient.sendFundToBeneficiary(
      {},
      {
        sendParams: {
          fee: algokit.algos(0.002),
        },
      }
    );
    expect(result.confirmation).toBeDefined();

    const { amount: finalAmount } = await algorand.account.getInformation(appAddress);
    console.log(`finalAmount: ${finalAmount}`);
  });

  // Clear the state of the smart contract
  test('deleteApplication', async () => {
    const result = await appClient.delete.deleteApplication({});

    expect(result.confirmation).toBeDefined();
  });
});
