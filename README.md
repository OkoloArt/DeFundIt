# DeFundIt - A Crowdfunding Smart Contract on Algorand

DeFundIt is a smart contract built on the Algorand blockchain using TEALScript. It allows for a crowdfunding campaign where users can send funds to a contract with a set funding target and minimum contribution amount. Once the funding goal is reached, the funds are transferred to a designated beneficiary.

## Features

- **Minimum Funding Amount**: Set a minimum amount that each contributor must send.
- **Funding Target**: Define a target funding goal that needs to be reached before funds are released to the beneficiary.
- **Beneficiary Address**: Specify the address of the beneficiary who will receive the funds once the target is met.
- **Fund Tracking**: The contract tracks the total funds contributed towards the target.
- **Safe Funding**: Ensure that no contributions exceed the funding target.
- **Automatic Transfer**: Once the funding target is met, the total funds are automatically transferred to the beneficiary.
- **Contract Deletion**: The contract creator has the ability to delete the contract once it's no longer needed.

## Contract Structure

### Global State Keys

- `minimumFunding`: The minimum amount that can be contributed in Algos (set to 1 Algo).
- `fundingTarget`: The target funding goal (set to 10,000,000 Algos).
- `beneficiaryAddress`: The address of the beneficiary who will receive the funds.
- `funds`: The current total funds raised.

## Functions

### 1. `createApplication(addr: Address)`

Initializes the DeFundIt contract with the following parameters:

- **Minimum Funding Amount**: Set to 1 Algo.
- **Funding Target**: Set to 10,000,000 Algos.
- **Beneficiary Address**: The address provided during contract creation.
- **Initial Funds**: Set to 0.

### 2. `sendFunding(senderTxn: PayTxn)`

Processes a payment transaction to contribute funds to the contract. The function performs the following checks:

- The amount of the payment must be greater than or equal to the minimum funding amount.
- The total funds after the transaction must not exceed the funding target.
  
If both checks pass, the funds are added to the total in the contract.

### 3. `SendFundToBeneficiary()`

Transfers the total funds to the beneficiary when the funding target is reached. The following checks are made:

- The total funds must match the funding target.
  
Once the condition is met, the contract transfers the funds to the beneficiary address with a note: "DeFundIt funds sent".

### 4. `getBeneficiaryAddress(): Address`

Returns the beneficiary's address associated with the contract. This address is used for the transfer once the target is met.

### 5. `deleteApplication()`

Allows the creator of the contract to delete the application when it's no longer needed. The following check is made:

- The sender of the transaction must be the creator of the contract.

## Usage

1. **Create the Contract**: Call the `createApplication` function with the beneficiary's address.
2. **Fund the Contract**: Contributors send Algos using the `sendFunding` function. Contributions are tracked as long as they meet the minimum funding amount and do not exceed the target.
3. **Transfer Funds to Beneficiary**: Once the funding target is reached, the contract automatically transfers the funds to the beneficiary using `SendFundToBeneficiary`.
4. **Delete the Contract**: The contract creator can delete the application by calling `deleteApplication` when it's no longer needed.

## Requirements

- **Algorand Account**: The contract requires a valid Algorand account for both the creator and the beneficiary.
- **TEALScript**: This contract is written using TEALScript, which compiles to TEAL for execution on the Algorand blockchain.

## Example Scenario

1. A user creates the DeFundIt contract with a beneficiary address.
2. Contributors send funds to the contract as long as the minimum funding amount is met.
3. The total funds are tracked, and once the target of 10,000,000 Algos is reached, the funds are automatically sent to the beneficiary.
4. After the successful transfer, the creator can delete the contract from the blockchain.

## License

This project is open source and available under the [MIT License](LICENSE).

