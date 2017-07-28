// app state
// ===================
// These variables represent the state of our application, they tell us at
// any given moment the state of our blackjack game. You might find it useful
// to use these to debug issues by console logging them in the functions below.
var deckID = "";
var dealerCards = [];
var playerCards = [];
var playerScore = 0;
var dealerScore = 0;
var roundLost = false;
var roundWon = false;
var roundTied = false;
var roundsPlayedOfDeck = 0;
var roundPassed = false;
var firstDealerCardSrc = "";
var bettingChips = 1000;
var aceCount = 0;


// game play nodes:
// ===================
// These nodes will be used often to update the UI of the game.

// assign this variable to the DOM node which has id="dealer-number"
var dealerScoreNode = document.querySelector('#dealer-number');

// select the DOM node which has id="player-number"
var playerScoreNode = document.querySelector('#player-number');

// select the DOM node which has id="dealer-cards"
var dealerCardsNode = document.querySelector('#dealer-cards');

// select the DOM node which has id="player-cards"
var playerCardsNode = document.querySelector('#player-cards');

// selec the DOM node which has id="announcement"
var announcementNode = document.querySelector('#announcement');

// selec the DOM node which has id=new-game"
var newDeckNode = document.querySelector('#new-game');

// selec the DOM node which has id="next-hand"
var nextHandNode = document.querySelector('#next-hand')

// selec the DOM node which has id=""hit-me""
var hitMeNode = document.querySelector("#hit-me");

// selec the DOM node which has id="stay"
var stayNode = document.querySelector("#stay");

var roundPlaysNode = document.querySelector("#rounds-played-counter");

var chipsCountNode = document.querySelector("#chips-counter");

var betAmountInputNode = document.querySelector("#bet-input");

// On click events
// ==================
// These events define the actions to occur when a button is clicked.
// These are provided for you and serve as examples for creating further
// possible actions of your own choosing.
newDeckNode.onclick = getNewDeck;
nextHandNode.onclick = newHand;
hitMeNode.onclick = () => hitMe('player');
stayNode.onclick = () => setTimeout(() => dealerPlays(), 600);
// ==================


// Game mechanics functions
// ========================

function getNewDeck() {
    /* This function needs to:
    1) Call the resetPlayingArea function
    2) Make a call to deckofcardsapi in order to retrieve a new deck_id
    3) Set the value of our state variable deckID to the retrieved deck_id
    4) Change the display property of style on the nextHandNode element in order
    to provide the player with the Next Hand button.
    5) Hide the hit-me and stay buttons by changing their style.display to "none"
    6) Catch any errors that may occur on the fetch and log them */
    resetPlayingArea();
    roundsPlayedOfDeck = 0; // reset the rounds played for this deck
    roundPlaysNode.textContent = roundsPlayedOfDeck;
    fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6")
        .then(response => response.json())
        .then(response => {
            deckID = response.deck_id;
            nextHandNode.style.display="flex";
            hitMeNode.style.display="none";
            stayNode.style.display="none";
        })
        .catch( err => console.error("during reset play area " + err) );

}

function computeScore(cards) {
    // This function receives an array of cards and returns the total score.
    // ...
    var totalScoreReturn = 0;
    var cardValue = 0;
    cards.forEach( singleCard => {
        if (singleCard.value === "ACE"){
            cardValue = 11;
            aceCount++;
        }
        else if (singleCard.value.length > 2){ //i.e. all face cards excluding ACE, needs to be over 10 as "10" is string length 2
            cardValue = 10;
        }
        else {
            cardValue = parseInt(singleCard.value);
        }
        totalScoreReturn += cardValue;
    });

    if (totalScoreReturn > 21 && aceCount > 0){
        totalScoreReturn -= 10;
        aceCount--;
    }

    return totalScoreReturn;
}


function newHand() {
    /* This function needs to:
    1) Call the resetPlayingArea function
    2) Make a call to deckofcardsapi using the deckID state variale in order
    to retrieve draw 4 cards from the deck.
    3) Once 4 cards have been drawn, push 2 of them to our dealerCards state
    array and 2 to our playerCards state array.
    4) Set our dealerScore state variable to "?" and then set the textContent
    value of the dealerScoreNode to dealerScore;
    5) ForEach card in playerCards and dealerCards, create an <img> element
    and assign the src of these to their respective card images. Don't forget to
    append these newly created <img> elements to the respective #dealer-cards and
    #player-cards DOM elements in order to have them show up in the html.
    6) Finally, compute the player's score by calling computeScore() and update
    the playerScoreNode to reflect this.
    7) If player score is 21, announce immediate victory by setting:
    roundWon = true;
    announcementNode.textContent = "BlackJack! You Win!";
    8) catch and log possible error from the fetch.
    */

    if (!betAmountInputNode.value){
        announcementNode.textContent = "NO BET!" ;
        return;
    }

    bettingChips -= betAmountInputNode.value; //initial bet
    chipsCountNode.textContent = bettingChips; //show user they put money on the table!

    hitMeNode.style.display="flex"; //I.e. we can make hit and stays now that the player has a hand!
    stayNode.style.display="flex";

    if (!(roundTied || roundLost || roundWon)) { //i.e. the player chose to press "next hand" but the prior game has not been decided.
        roundPassed = true;
    }
    else {
        roundPassed = false;
    }

    resetPlayingArea();

    if ( roundPassed && roundsPlayedOfDeck > 0) { //i.e. if the game has not been decided AND the deck IS NOT new (so this won't pop up on the first hand of a new deck)
        announcementNode.textContent = "Passed last round!";
    }

    fetch( "https://deckofcardsapi.com/api/deck/" + deckID + "/draw/?count=4" )
        .then( response => response.json())
        .then( response => {
            if (response.cards.length < 4){
                throw new Error("For some reason the drawn hand size is less than 4")
            }

            dealerCards.push.apply( dealerCards, response.cards.slice(0,2) ); //one-liner instead of push(response.cards[0]); push(response.cards[1]);
            playerCards.push.apply( playerCards, response.cards.slice(2,4) );

            dealerScore = "?";
            dealerScoreNode.textContent = dealerScore;

            dealerCards.forEach( dealerCard => { //recall we are passing to this forEach the 'cards' property from response which has value, image, code, suit, images
                var imgDCard = document.createElement('img');
                imgDCard.setAttribute('src', dealerCard.images.png );
                dealerCardsNode.append(imgDCard);
            });

            firstDealerCardSrc = dealerCardsNode.firstElementChild.getAttribute('src');
            dealerCardsNode.firstElementChild.setAttribute('src', "./card.png");

            playerCards.forEach( playerCard => { //recall we are passing to this forEach the 'cards' property from response which has value, image, code, suit, images
                var imgPCard = document.createElement('img');
                imgPCard.setAttribute('src', playerCard.images.png );
                playerCardsNode.append(imgPCard);
            });

            playerScore = computeScore(playerCards);
            playerScoreNode.textContent = playerScore;

            if (playerScore === 21){
                roundWon = true;
                calculateFinalChips(); //Another way to win is to get BJ on the first hand
                announcementNode.textContent = "BlackJack! You Win!";
            }

        })
        .catch( err => console.error("during newHand()" + err) );


    roundsPlayedOfDeck++;
    roundPlaysNode.textContent = roundsPlayedOfDeck;
}


function resetPlayingArea() {
    /* This function needs to:
    1) Reset all state variables to their defaults
    2) Reset the gameplay UI by updating textContent of all Nodes which may
    be displaying data from a previous round in the game. (ex: dealerScoreNode)
    3) Remove all <img> elements inside dealerCardsNode and playerCardsNode.
    */
    dealerCards = [];
    playerCards = [];
    playerScore = 0;
    dealerScore = 0;
    roundLost = false;
    roundWon = false;
    roundTied = false;
    aceCount = 0;
    dealerScoreNode.textContent = "";
    playerScoreNode.textContent = "";
    announcementNode.textContent = "";
    var imagesD = dealerCardsNode.getElementsByTagName('img');
    while(imagesD.length > 0) {
        imagesD[0].parentNode.removeChild(imagesD[0]);
    }
    var imagesP = playerCardsNode.getElementsByTagName('img');
    while(imagesP.length > 0) {
        imagesP[0].parentNode.removeChild(imagesP[0]);
    }
}


function hitMe(target) {
    /* This function needs to:
    1) If any of roundLost or roundWon or roundTied is true, return immediately.
    2) Using the same deckID, fetch to draw 1 card
    3) Depending on wether target is 'player' or 'dealer', push the card to the
    appropriate state array (playerCards or dealerCards).
    4) Create an <img> and set it's src to the card image and append it to the
    appropriate DOM element for it to appear on the game play UI.
    5) If target === 'player', compute score and immediately announce loss if
    score > 21 by setting:
    roundLost = true;
    and updating announcementNode to display a message delivering the bad news.
    6) If target === 'dealer', just call the dealerPlays() function immediately
    after having appended the <img> to the game play UI.
    7) Catch error and log....
    */

    if (roundTied || roundLost || roundWon){
        return;
    }

    fetch( "https://deckofcardsapi.com/api/deck/" + deckID + "/draw/?count=1" )
        .then( response => response.json())
        .then( cardDrawInitial => {
            var cardDraw = cardDrawInitial.cards; //i.e. just take the array of cards (of length 1) and put into this variable name
            var hitCard = document.createElement('img');
            hitCard.setAttribute('src', cardDraw[0].images.png);

            if (target === "dealer"){
                dealerCardsNode.append(hitCard);
                dealerCards.push(cardDraw[0]); //if we just put cardDraw without specifiying the index even though its array size 1 it'd make a nested array (2d array)
                dealerPlays();
            }
            else if (target === "player") {
                playerCardsNode.append(hitCard);
                playerCards.push(cardDraw[0]);
                playerScore = computeScore(playerCards);
                playerScoreNode.textContent = playerScore;
                if ( playerScore > 21) {
                    roundLost = true;
                    announcementNode.textContent = "BUST!";
                }
            }

        })
        .catch( err => console.error("during hitMe()" + err) );

}

function dealerPlays() {
    /* This function needs to:
    1) If any of roundLost or roundWon or roundTied is true, return immediately.
    2) Compute the dealer's score by calling the computeScore() function and
    update the UI to reflect this.
    */

    dealerCardsNode.firstElementChild.setAttribute('src', firstDealerCardSrc);

    dealerScore = computeScore(dealerCards);
    dealerScoreNode.textContent = dealerScore;

    if (dealerScore < 17) {
        // a delay here makes for nicer game play because of suspense.
        setTimeout(()=>hitMe('dealer'), 900)
    }
    else if (dealerScore > 21) {
        roundWon = true;
        // ... Update the UI to reflect this...
        announcementNode.textContent = "Won";
    }
    else if (dealerScore > playerScore) {
        roundLost = true;
        // ... Update the UI to reflect this...
        announcementNode.textContent = "Lost";
    }
    else if (dealerScore === playerScore) {
        roundTied = true;
        // ... Update the UI to reflect this...
        announcementNode.textContent = "Tie";
    }
    else {
        roundWon = true;
        // ... Update the UI to reflect this...
        announcementNode.textContent = "Won";
    }

    if (roundTied || roundLost || roundWon){
        calculateFinalChips();
        return;
    }

}

function calculateFinalChips () {
    if (roundWon){
        bettingChips += parseInt(betAmountInputNode.value * 2);
        chipsCountNode.textContent = bettingChips; //show user they put money on the table!
    }
    else if (roundTied){
        bettingChips += parseInt(betAmountInputNode.value); //re-add initial bet
        chipsCountNode.textContent = bettingChips;
    }
}