import { db } from "./firebase.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    updateDoc,
    setDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const roundText = document.getElementById("roundText");
const statusText = document.getElementById("statusText");

const playerCount = document.getElementById("playerCount");
const voteCount = document.getElementById("voteCount");

const revealResultsBtn = document.getElementById("revealResultsBtn");
const resultsSection = document.getElementById("resultsSection");
const resultsContainer = document.getElementById("resultsContainer");

const startVotingBtn = document.getElementById("startVotingBtn");
const nextRoundBtn = document.getElementById("nextRoundBtn");
const endGameBtn = document.getElementById("endGameBtn");
const resetGameBtn = document.getElementById("resetGameBtn");

const gameRef = doc(db, "game", "current");

let latestResults = [];

// -------------------------
// Live Game Listener
// -------------------------

onSnapshot(gameRef, async (snapshot) => {

    if (!snapshot.exists()) return;

    const game = snapshot.data();

    roundText.textContent = `Round ${game.round}`;
    statusText.textContent = `Status: ${game.status}`;

    resultsSection.style.display = "none";

    await loadDashboard(game.round);

});

// -------------------------
// Dashboard
// -------------------------

async function loadDashboard(round) {

    const playersSnapshot = await getDocs(collection(db, "players"));

    playerCount.textContent = playersSnapshot.size;

    const players = {};

    playersSnapshot.forEach((docSnap) => {
        players[docSnap.id] = docSnap.data();
    });

    const votesSnapshot = await getDocs(
        collection(db, "votes", `round_${round}`, "responses")
    );

    voteCount.textContent = `${votesSnapshot.size} / ${playersSnapshot.size}`;

    const totals = {};

    votesSnapshot.forEach((voteDoc) => {

        const vote = voteDoc.data();

        totals[vote.selectedPlayerId] =
            (totals[vote.selectedPlayerId] || 0) + 1;

    });

    latestResults = Object.entries(totals)
        .map(([playerId, votes]) => ({
            playerId,
            name: players[playerId]?.name || "Unknown",
            votes
        }))
        .sort((a, b) => b.votes - a.votes);

}

// -------------------------
// Reveal Results
// -------------------------

revealResultsBtn.addEventListener("click", () => {

    resultsSection.style.display = "block";

    if (latestResults.length === 0) {

        resultsContainer.innerHTML =
            "<p>No votes submitted yet.</p>";

        return;
    }

    const maxVotes = latestResults[0].votes;

    let html = "";

    latestResults.forEach((player, index) => {

        const percent = (player.votes / maxVotes) * 100;

        const medal =
            index === 0 ? "🥇" :
            index === 1 ? "🥈" :
            index === 2 ? "🥉" :
            "";

        html += `
            <div class="result-card">

                <div class="result-header">
                    <span>${medal} <strong>${player.name}</strong></span>
                    <span>${player.votes}</span>
                </div>

                <div class="vote-bar">
                    <div
                        class="vote-fill"
                        data-width="${percent}">
                    </div>
                </div>

            </div>
        `;

    });

    html += `
        <div id="winnerCard">
            🏆 Winner<br><br>
            <strong>${latestResults[0].name}</strong><br>
            ${latestResults[0].votes} vote${latestResults[0].votes > 1 ? "s" : ""}
        </div>
    `;

    resultsContainer.innerHTML = html;

    // Animate bars after rendering
    requestAnimationFrame(() => {

        document.querySelectorAll(".vote-fill").forEach((bar, index) => {

            setTimeout(() => {

                bar.style.width = bar.dataset.width + "%";

            }, index * 250);

        });

    });

});

// -------------------------
// Start Voting
// -------------------------

startVotingBtn.addEventListener("click", async () => {

    await updateDoc(gameRef, {
        status: "voting"
    });

});

// -------------------------
// Next Round
// -------------------------

nextRoundBtn.addEventListener("click", async () => {

    const snapshot = await getDoc(gameRef);

    if (!snapshot.exists()) {
        return;
    }

    const game = snapshot.data();

    // Reset all players
    const playersSnapshot = await getDocs(collection(db, "players"));

    const updates = [];

    playersSnapshot.forEach((playerDoc) => {

        updates.push(
            setDoc(
                doc(db, "players", playerDoc.id),
                {
                    hasVoted: false
                },
                { merge: true }
            )
        );

    });

    await Promise.all(updates);

    // Clear previous results
    latestResults = [];
    resultsContainer.innerHTML = "";
    resultsSection.style.display = "none";

    // Move to next round
    await updateDoc(gameRef, {
        round: game.round + 1,
        status: "waiting"
    });

});

// -------------------------
// End Game
// -------------------------

endGameBtn.addEventListener("click", async () => {

    await updateDoc(gameRef, {
        status: "ended"
    });

});

// -------------------------
// Reset Game
// -------------------------

resetGameBtn.addEventListener("click", async () => {

    const confirmed = confirm(
        "This will permanently delete all players and votes. Continue?"
    );

    if (!confirmed) {
        return;
    }

    try {

        // Delete all players
        const playersSnapshot = await getDocs(collection(db, "players"));

        await Promise.all(
            playersSnapshot.docs.map(player =>
                deleteDoc(player.ref)
            )
        );

        // Delete votes (current implementation supports up to current round)
        const gameSnapshot = await getDoc(gameRef);
        const game = gameSnapshot.data();

        for (let round = 1; round <= game.round; round++) {

            const votesSnapshot = await getDocs(
                collection(db, "votes", `round_${round}`, "responses")
            );

            await Promise.all(
                votesSnapshot.docs.map(vote =>
                    deleteDoc(vote.ref)
                )
            );

        }

        // Reset game state
        await updateDoc(gameRef, {
            round: 1,
            status: "waiting"
        });

        latestResults = [];
        resultsContainer.innerHTML = "";
        resultsSection.style.display = "none";

        alert("Game has been reset successfully.");

    } catch (error) {

        console.error(error);

        alert("Failed to reset the game.");

    }

});