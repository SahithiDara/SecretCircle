import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ================================
// Generate Player ID
// ================================

function generatePlayerId() {

    return crypto.randomUUID();

}

// ================================
// Register Player
// ================================

export async function registerPlayer(name, gender) {

    // Remove extra spaces
    name = name.trim();

    // Check duplicate name
    const playerQuery = query(
        collection(db, "players"),
        where("nameLower", "==", name.toLowerCase())
    );

    const existingPlayers = await getDocs(playerQuery);

    if (!existingPlayers.empty) {

        throw new Error("This name is already taken.");

    }

    const playerId = generatePlayerId();

    const player = {

        name,

        nameLower: name.toLowerCase(),

        gender,

        hasVoted: false,

        joinedAt: serverTimestamp(),

        lastSeen: serverTimestamp()

    };

    await setDoc(

        doc(db, "players", playerId),

        player

    );

    // Save locally

    localStorage.setItem("playerId", playerId);

    localStorage.setItem("playerName", name);

    localStorage.setItem("playerGender", gender);

    return player;

}

// ================================
// Restore Player
// ================================

export async function restorePlayer() {

    const playerId = localStorage.getItem("playerId");

    if (!playerId) {
        return null;
    }

    const snapshot = await getDoc(doc(db, "players", playerId));

    if (!snapshot.exists()) {

        localStorage.clear();

        return null;

    }

    return {
        id: playerId,
        ...snapshot.data()
    };

}

// ================================
// Get Voting Options
// ================================

export async function getVotingOptions() {

    const currentPlayerId = localStorage.getItem("playerId");
    const currentPlayerGender = localStorage.getItem("playerGender");

    if (!currentPlayerId || !currentPlayerGender) {
        return [];
    }

    const snapshot = await getDocs(collection(db, "players"));

    const players = [];

    snapshot.forEach((playerDoc) => {

        const player = playerDoc.data();

        // Don't show yourself
        if (playerDoc.id === currentPlayerId) {
            return;
        }

        // Only show opposite gender
        if (player.gender === currentPlayerGender) {
            return;
        }

        players.push({
            id: playerDoc.id,
            name: player.name,
            gender: player.gender
        });

    });

    players.sort((a, b) => a.name.localeCompare(b.name));

    return players;

}

// ================================
// Submit Vote
// ================================

export async function submitVote(selectedPlayerId) {

    const voterId = localStorage.getItem("playerId");

    if (!voterId) {
        throw new Error("Player not found.");
    }

    // Get current round
    const gameSnapshot = await getDoc(doc(db, "game", "current"));

    if (!gameSnapshot.exists()) {
        throw new Error("Game not found.");
    }

    const game = gameSnapshot.data();
    const round = game.round;

    // Save vote
    await setDoc(
        doc(db, "votes", `round_${round}`, "responses", voterId),
        {
            voterId,
            selectedPlayerId,
            submittedAt: serverTimestamp()
        }
    );

    // Mark player as voted
    await setDoc(
        doc(db, "players", voterId),
        {
            hasVoted: true
        },
        { merge: true }
    );

}