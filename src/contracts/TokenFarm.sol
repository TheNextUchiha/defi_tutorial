pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
    string public name = "Dapp Token Farm";
    DappToken public dappToken;
    DaiToken public daiToken;

    address[] public stakers;
    address public owner;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(DappToken _dappToken, DaiToken _daiToken) public{
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    // Staking Tokens (Deposit)
    function stakeTokens(uint _amount) public {
        // Require amount greater than 0
        require(_amount > 0, 'Amount cannot be 0');

        // Transfer DAI Tokens to this contract
        daiToken.transferFrom(msg.sender, address(this), _amount);

        // Update Staking balance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        // Add user to the stakers array, if they have not staked
        if(!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        // Update staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    // Unstaking Tokens (Withdraw)
    function unstakeTokens() public {
        // Fetch balance
        uint  balance = stakingBalance[msg.sender];

        // Require amount greater than 0
        require(balance > 0, 'Staking balance cannot be 0');

        // Transfer mock Dai to this contract for staking
        daiToken.transfer(msg.sender, balance);

        // Reset Staking Balance
        stakingBalance[msg.sender] = 0;

        // Update staking balance
        isStaking[msg.sender] = false;
    }

    // Issuing Tokens
    function issueTokens() public  {
        // Only owner can call this function
        require(msg.sender == owner, "Caller must be owner");

        // Issue tokens to the stakers
        for(uint i = 0; i<stakers.length; i++) {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if(balance > 0) {
                dappToken.transfer(recipient, balance);
            }
        }
    }
}