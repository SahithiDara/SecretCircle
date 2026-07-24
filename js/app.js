import {
    registerPlayer,
    restorePlayer,
    getVotingOptions,
    submitVote
} from "./player.js";

import { listenToGame } from "./game.js";
import { db } from "./firebase.js";

import {
    doc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// =============================
// SCREENS
// =============================

const screens = {
    landing: document.getElementById("landing"),
    register: document.getElementById("register"),
    waiting: document.getElementById("waiting"),
    voting: document.getElementById("voting"),
    submitted: document.getElementById("submitted")
};

// =============================
// BUTTONS
// =============================

const startBtn = document.getElementById("startBtn");
const continueBtn = document.getElementById("continueBtn");
const submitVoteBtn = document.getElementById("submitVoteBtn");

// =============================
// INPUTS
// =============================

const playerNameInput = document.getElementById("playerName");
const welcomeText = document.getElementById("welcomeText");
const optionsContainer = document.getElementById("optionsContainer");
const roundTitle = document.getElementById("roundTitle");
const waitingRoundText = document.getElementById("waitingRoundText");
const submittedRoundText = document.getElementById("submittedRoundText");

// =============================
// APP STATE
// =============================

let currentGame = null;
let currentPlayer = null;

// =============================
// FUNCTIONS
// =============================

function showScreen(screenName) {

    Object.values(screens).forEach(screen => {
        screen.classList.remove("active");
    });

    screens[screenName].classList.add("active");

}

async function loadOptions() {

    optionsContainer.innerHTML = "";

    const players = await getVotingOptions();

    if (players.length === 0) {

        optionsContainer.innerHTML = `
            <p>No players available to vote for.</p>
        `;

        return;

    }

    players.forEach((player) => {

        const label = document.createElement("label");

        label.className = "option";

        label.innerHTML = `
            <input
                type="radio"
                name="vote"
                value="${player.id}">
            ${player.name}
        `;

        optionsContainer.appendChild(label);

    });

}

async function updatePlayerScreen() {

    if (!currentGame || !currentPlayer) {
        return;
    }

    if (roundTitle && currentGame?.round) {
        roundTitle.textContent = `Round ${currentGame.round}`;
        waitingRoundText.textContent = `Waiting for Round ${currentGame.round}`;
        submittedRoundText.textContent = `Round ${currentGame.round}`;
    }

    switch (currentGame.status) {

        case "waiting":

            showScreen("waiting");
            break;

        case "voting":

            if (currentPlayer.hasVoted) {

                showScreen("submitted");

            } else {

                await loadOptions();
                showScreen("voting");

            }

            break;

        case "ended":

            showScreen("submitted");
            welcomeText.innerHTML = "🎉 Game Finished! Thanks for playing.";
            break;
    }

}

// =============================
// EVENTS
// =============================

// Landing → Register

startBtn.addEventListener("click", () => {

    showScreen("register");

});

// Register Player

continueBtn.addEventListener("click", async () => {

    const name = playerNameInput.value.trim();

    const gender = document.querySelector(
        "input[name='gender']:checked"
    );

    if (!name) {

        alert("Please enter your name.");
        return;

    }

    if (!gender) {

        alert("Please select your gender.");
        return;

    }

    try {

        const player = await registerPlayer(
            name,
            gender.value
        );

        welcomeText.innerHTML = `Welcome ${player.name} 👋`;

        showScreen("waiting");

    } catch (error) {

        alert(error.message);

    }

});

// Submit Vote

submitVoteBtn.addEventListener("click", async () => {

    const selected = document.querySelector(
        "input[name='vote']:checked"
    );

    if (!selected) {

        alert("Please select one option.");
        return;

    }

    try {

        await submitVote(selected.value);

    } catch (error) {

        console.error(error);

        alert("Failed to submit vote.");

    }

});

// =============================
// INITIALIZE APP
// =============================

async function initializeApp() {

    try {

        currentPlayer = await restorePlayer();

        if (!currentPlayer) {

            showScreen("landing");
            return;

        }

        welcomeText.innerHTML = `Welcome ${currentPlayer.name} 👋`;

        const playerId = localStorage.getItem("playerId");

        // Listen for game changes
        listenToGame(async (game) => {

            currentGame = game;

            await updatePlayerScreen();

        });

        // Listen for player changes
        onSnapshot(

            doc(db, "players", playerId),

            async (snapshot) => {

                if (!snapshot.exists()) {

                    localStorage.clear();

                    showScreen("landing");

                    return;

                }

                currentPlayer = {

                    id: snapshot.id,

                    ...snapshot.data()

                };

                await updatePlayerScreen();

            }

        );

    } catch (error) {

        console.error(error);

        showScreen("landing");

    }

}

initializeApp();