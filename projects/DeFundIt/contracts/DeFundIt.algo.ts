import { Contract } from '@algorandfoundation/tealscript';

export class DeFundIt extends Contract {
  minimumFunding = GlobalStateKey<uint64>();

  fundingTarget = GlobalStateKey<uint64>();

  beneficiaryAddress = GlobalStateKey<Address>();

  funds = GlobalStateKey<uint64>();

  /**
   * Initializes the DeFundIt application with the provided beneficiary address.
   *
   * @param addr - The Algorand address of the beneficiary.
   *
   * @remarks
   * This function sets the minimum funding amount to 1 Algo, the funding target to 10,000,000 Algo,
   * and initializes the funds to 0 Algo. The beneficiary address is set to the provided address.
   *
   * @returns {void}
   */
  createApplication(addr: Address, fundingTarget: uint64): void {
    this.minimumFunding.value = 1;
    this.fundingTarget.value = fundingTarget;
    this.beneficiaryAddress.value = addr;
    this.funds.value = 0;
  }

  /**
   * Processes a payment transaction and updates the funds in the DeFundIt application.
   *
   * @param senderTxn - The payment transaction to be processed.
   *
   * @remarks
   * This function verifies the payment transaction, checks if the amount is greater than or equal to the minimum funding amount,
   * and ensures that the total funds after the transaction do not exceed the funding target.
   * If the conditions are met, the function updates the funds in the application.
   *
   * @returns {void}
   */
  sendFunding(senderTxn: PayTxn): void {
    assert(senderTxn.amount >= this.minimumFunding.value, 'quantity must be >= this.minimumFunding.value');
    assert(this.funds.value + senderTxn.amount <= this.fundingTarget.value, 'funding target must be higher than funds');

    verifyPayTxn(senderTxn, {
      sender: this.txn.sender,
      receiver: this.app.address,
    });

    this.funds.value += senderTxn.amount;
  }

  /**
   * Transfers the funds to the beneficiary address if the total funds match the funding target.
   *
   * @remarks
   * This function verifies if the total funds in the DeFundIt application match the funding target.
   * If the condition is met, it sends a payment transaction to the beneficiary address with the
   * current funds amount and a note indicating the transfer.
   *
   * @throws Throws an assertion error if the total funds do not match the funding target.
   *
   * @returns {void}
   */
  SendFundToBeneficiary(): void {
    assert(this.funds.value === this.fundingTarget.value, 'Funds must be equal to the funding target');

    sendPayment({
      receiver: this.beneficiaryAddress.value,
      amount: this.funds.value,
      note: 'DeFundIt funds sent',
      sender: this.app.address,
    });
  }

  /**
   * Retrieves the beneficiary address associated with the DeFundIt application.
   *
   * @returns {Address} - The Algorand address of the beneficiary.
   *
   * @remarks
   * This function returns the beneficiary address that was set during the application initialization.
   * The beneficiary address is used to receive funds once the total funds match the funding target.
   */
  getBeneficiaryAddress(): Address {
    return this.beneficiaryAddress.value;
  }

  /**
   * Deletes the DeFundIt application from the Algorand blockchain.
   *
   * @remarks
   * This function is intended to be called when the DeFundIt application is no longer needed.
   * It verifies that the sender of the transaction is the creator of the application and then
   * deletes the application from the Algorand blockchain.
   *
   * @throws Throws an assertion error if the sender of the transaction is not the creator of the application.
   *
   * @returns {void}
   */
  deleteApplication(): void {
    assert(this.app.creator === this.txn.sender, 'sender must be the creator of the application');
    // Implementation of deleteApplication function
  }
}
