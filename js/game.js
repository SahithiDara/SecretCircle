import { db } from "./firebase.js";

import {
    doc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

/**
 * Listen to game state changes
 *
 * callback(game)
 */
export function listenToGame(callback) {

    const gameRef = doc(
        db,
        "game",
        "current"
    );

    return onSnapshot(gameRef, (snapshot) => {

        if (!snapshot.exists()) {

            console.error("Game document not found.");

            return;

        }

        callback(snapshot.data());

    });

}