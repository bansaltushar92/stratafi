// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract StratToken is ERC20, ERC20Permit, Ownable, ERC20Votes {
    uint256 public targetRaise;
    uint256 public amountRaised;
    uint256 public pricePerToken;
    address public treasury;
    bool public isFundraisingActive;
    
    enum Status { Pending, Fundraising, Completed, Trading, Failed }
    Status public status;

    event FundraisingStarted(uint256 targetAmount, uint256 price);
    event ContributionReceived(address contributor, uint256 amount);
    event FundraisingCompleted(uint256 totalRaised);
    event FundraisingFailed();

    constructor(
        string memory name,
        string memory symbol,
        uint256 _targetRaise,
        uint256 _pricePerToken,
        address _treasury,
        address initialOwner
    ) ERC20(name, symbol) ERC20Permit(name) Ownable(initialOwner) {
        require(_treasury != address(0), "Invalid treasury address");
        require(_targetRaise > 0, "Invalid target raise");
        require(_pricePerToken > 0, "Invalid price per token");

        targetRaise = _targetRaise;
        pricePerToken = _pricePerToken;
        treasury = _treasury;
        status = Status.Pending;
        _mint(treasury, _targetRaise * 10**decimals());
    }

    function startFundraising() external onlyOwner {
        require(status == Status.Pending, "Invalid status");
        status = Status.Fundraising;
        isFundraisingActive = true;
        emit FundraisingStarted(targetRaise, pricePerToken);
    }

    function contribute() external payable {
        require(status == Status.Fundraising, "Fundraising not active");
        require(msg.value > 0, "Invalid contribution amount");
        
        uint256 tokenAmount = (msg.value * 10**decimals()) / pricePerToken;
        require(tokenAmount > 0, "Contribution too small");
        
        amountRaised += msg.value;
        _transfer(treasury, msg.sender, tokenAmount);
        
        emit ContributionReceived(msg.sender, msg.value);
        
        if (amountRaised >= targetRaise) {
            status = Status.Completed;
            isFundraisingActive = false;
            emit FundraisingCompleted(amountRaised);
        }
    }

    function endFundraising() external onlyOwner {
        require(status == Status.Fundraising, "Not in fundraising");
        if (amountRaised >= targetRaise) {
            status = Status.Completed;
            emit FundraisingCompleted(amountRaised);
        } else {
            status = Status.Failed;
            emit FundraisingFailed();
        }
        isFundraisingActive = false;
    }

    // Override required functions
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
} 