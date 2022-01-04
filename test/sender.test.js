const { ethers } = require('hardhat');
const assert = require('assert/strict');

describe('Sender', function () {
  let Sender, deploymentCost;

  let signer, signerBalanceBefore;

  let targets, targetBalancesBefore;

  const NUM_TARGETS = 700;
  const SEND_VALUE = ethers.utils.parseEther('1')
  const TOTAL_SEND_VALUE = SEND_VALUE.mul(NUM_TARGETS);

  before('get signers', async function () {
    const signers = await ethers.getSigners();
    signer = signers[0];
  });

  before('get targets', async function () {
    targets = [];

    for (let i = 0; i < NUM_TARGETS; i++) {
      const randomWallet = ethers.Wallet.createRandom();

      targets.push(randomWallet.address);
    }
  });

  before('record signer balance', async function () {
    signerBalanceBefore = await ethers.provider.getBalance(signer.address);
  });

  before('record target balances', async function () {
    targetBalancesBefore = {};

    for (let target of targets) {
      targetBalancesBefore[target] = await ethers.provider.getBalance(target);
    }
  });

  before('deploy', async function () {
    const factory = await ethers.getContractFactory('Sender');

    Sender = await factory.deploy(targets, {
      value: TOTAL_SEND_VALUE,
    });

    const tx = Sender.deployTransaction;
    const receipt = await Sender.deployTransaction.wait();
    deploymentCost = receipt.gasUsed.mul(tx.gasPrice);
  });

  it('deployed the contract', async function () {
    assert.ok(Sender);
    assert.ok(Sender.address);
  });

  it('reduced the signer balance', async function () {
    const signerBalanceAfter = await ethers.provider.getBalance(signer.address);
    const deltaBalance = signerBalanceBefore.sub(signerBalanceAfter);

    assert.deepEqual(deltaBalance.sub(deploymentCost), TOTAL_SEND_VALUE);
  });

  it('sent ETH to all targets', async function () {
    for (let target of targets) {
      const targetBalanceBefore = targetBalancesBefore[target];
      const targetBalanceAfter = await ethers.provider.getBalance(target);
      const deltaBalance = targetBalanceAfter.sub(targetBalanceBefore);

      assert.deepEqual(deltaBalance, SEND_VALUE);
    }
  });
});
