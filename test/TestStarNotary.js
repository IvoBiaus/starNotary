const StarNotary = artifacts.require("StarNotary");

let accounts;
let owner;
let lastStarId = 0;

contract("StarNotary", (accs) => {
  accounts = accs;
  owner = accounts[0];
});

const getNextStarId = () => {
  lastStarId++;
  return lastStarId;
};

it("can Create a Star", async () => {
  let instance = await StarNotary.deployed();
  let tokenId = getNextStarId();

  await instance.createStar("Awesome Star!", tokenId, { from: accounts[0] });

  assert.equal(await instance.tokenIdToStarInfo.call(tokenId), "Awesome Star!");
});

it("lets user1 put up their star for sale", async () => {
  let instance = await StarNotary.deployed();

  let user1 = accounts[1];
  let starId = getNextStarId();
  let starPrice = web3.utils.toWei(".01", "ether");

  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });

  assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it("lets user1 get the funds after the sale", async () => {
  let instance = await StarNotary.deployed();

  let user1 = accounts[1];
  let user2 = accounts[2];

  let starId = getNextStarId();

  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");

  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });

  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
  await instance.buyStar(starId, { from: user2, value: balance });
  let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);

  let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
  let value2 = Number(balanceOfUser1AfterTransaction);

  assert.equal(value1, value2);
});

it("lets user2 buy a star, if it is put up for sale", async () => {
  let instance = await StarNotary.deployed();

  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = getNextStarId();
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");

  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  await instance.buyStar(starId, { from: user2, value: balance });

  assert.equal(await instance.ownerOf.call(starId), user2);
});

it("lets user2 buy a star and decreases its balance in ether", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = getNextStarId();
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance, gasPrice: 0 });
  const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
  let value =
    Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
  assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests
it("token name and token symbol are added properly", async () => {
  // 1. create a Star with different tokenId
  // 2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
  let instance = await StarNotary.deployed();

  assert.equal(await instance.name.call(), "Stella");
  assert.equal(await instance.symbol.call(), "STL");
});

it("can add the star name and star token properly", async () => {
  // 1. create a Star with different tokenId
  // 2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
  let instance = await StarNotary.deployed();

  let starToken = getNextStarId();
  let starName = "Sol";

  await instance.createStar(starName, starToken, { from: accounts[0] });
  assert.equal(await instance.tokenIdToStarInfo.call(starToken), starName);
});

it("lets 2 users exchange stars", async () => {
  // 1. create 2 Stars with different tokenId
  // 2. Call the exchangeStars functions implemented in the Smart Contract
  // 3. Verify that the owners changed
  let instance = await StarNotary.deployed();

  let user1 = accounts[0];
  let user2 = accounts[1];

  let starToken1 = getNextStarId();
  let starName1 = "Sol";

  let starToken2 = getNextStarId();
  let starName2 = "Proxima Centauri";

  await instance.createStar(starName1, starToken1, { from: user1 });
  await instance.createStar(starName2, starToken2, { from: user2 });

  assert.equal(await instance.ownerOf.call(starToken1), user1);
  assert.equal(await instance.ownerOf.call(starToken2), user2);

  await instance.exchangeStars(starToken1, starToken2, { from: user1 });

  assert.equal(await instance.ownerOf.call(starToken1), user2);
  assert.equal(await instance.ownerOf.call(starToken2), user1);
});

it("lets a user transfer a star", async () => {
  // 1. create a Star with different tokenId
  // 2. use the transferStar function implemented in the Smart Contract
  // 3. Verify the star owner changed.
  let instance = await StarNotary.deployed();

  let user1 = accounts[0];
  let user2 = accounts[1];

  let starToken = getNextStarId();
  let starName = "Sol";

  await instance.createStar(starName, starToken, { from: user1 });
  assert.equal(await instance.ownerOf.call(starToken), user1);

  await instance.transferStar(user2, starToken, { from: user1 });
  assert.equal(await instance.ownerOf.call(starToken), user2);
});

it("lookUptokenIdToStarInfo test", async () => {
  // 1. create a Star with different tokenId
  // 2. Call your method lookUptokenIdToStarInfo
  // 3. Verify if you Star name is the same
  let instance = await StarNotary.deployed();

  let user = accounts[0];

  let starToken = getNextStarId();
  let starName = "Sol";

  await instance.createStar(starName, starToken, { from: user });

  assert.equal(
    await instance.lookUptokenIdToStarInfo.call(starToken),
    starName
  );
});
