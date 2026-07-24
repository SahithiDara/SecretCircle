# SecretCircle

SecretCircle is a browser-based party game built with plain HTML, CSS, and JavaScript, backed by Firebase Firestore. Players register with a name and gender, wait for the host to start a round, and vote for another player of the opposite gender. The host can manage rounds, reveal results, and reset the game from the admin page.

## What the project does
- Lets players join a game from the main screen
- Shows a registration flow with name and gender selection
- Tracks round state and voting progress in real time
- Allows an admin to start voting, reveal results, move to the next round, end the game, or reset everything
- Displays vote results with animated bars and a winner card

## Main features
- Player registration and local persistence with browser storage
- Real-time game state updates from Firebase
- Voting UI with options filtered to opposite-gender players
- One vote per player per round
- Admin dashboard for round control and result viewing

## Requirements
- A modern web browser
- Internet access to load Firebase from the browser
- A Firebase project with Firestore enabled (or the existing project configuration in the code)

## Run locally
1. Open the project folder in a browser-friendly local server.
   - Example with Python:
     - `python -m http.server 8000`
2. Visit:
   - Player app: `http://localhost:8000/index.html`
   - Admin page: `http://localhost:8000/admin.html`

> Opening the files directly may cause module-loading issues in some browsers. A simple local server is recommended.

## Project structure
- [index.html](index.html): player-facing game screens
- [admin.html](admin.html): admin dashboard
- [css/style.css](css/style.css): styling for the app and admin UI
- [js/app.js](js/app.js): main player app flow and screen switching
- [js/admin.js](js/admin.js): admin controls and results display
- [js/player.js](js/player.js): player registration, vote loading, and vote submission logic
- [js/game.js](js/game.js): listens for game state changes
- [js/firebase.js](js/firebase.js): Firebase initialization and Firestore connection
- [assets/](assets): placeholder asset folder

## Gameplay flow
1. On the landing screen, tap “Let’s Go”.
2. Enter a name and choose a gender.
3. The player is added to the game and waits for the host.
4. When the host starts voting, the player sees a list of eligible opponents to vote for.
5. After submitting a vote, the player waits for the host to reveal results.

## Admin flow
- Start Voting: moves the game into the voting phase
- Reveal Results: shows the current round’s vote totals
- Next Round: resets player voting flags and advances the round
- End Game: marks the game as ended
- Reset Game: deletes all players and vote data and resets the round counter

## Firebase notes
The app uses Firestore collections and documents with these paths:
- `game/current` for the active round and status
- `players/{playerId}` for player records
- `votes/round_{n}/responses/{voterId}` for votes

If you want to use your own Firebase backend, update the configuration in [js/firebase.js](js/firebase.js) with your project credentials.

## Development notes
- The project is written as a lightweight frontend app with no build step.
- The UI is intentionally simple and can be extended with more rounds, animations, or custom game rules.
- The current implementation uses browser `localStorage` for the player session and Firestore for shared game state.

## License
No license file is currently included. If you want to publish this project publicly, add a license such as MIT and update this section accordingly.
