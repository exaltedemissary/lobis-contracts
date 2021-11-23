// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.7.5;

contract MockLinkUSDOracle {
  function latestRoundData()
    public
    pure
    returns (
      uint80,
      int256,
      uint256,
      uint256,
      uint80
    )
  {
    return (0, 2688000000, 0, 0, 0);
  }
}
