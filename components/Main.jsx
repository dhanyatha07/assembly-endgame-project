import clsx from "clsx";
import { languages } from "../languages";
import { useState } from "react";
import { getFarewellText, getRandomWord } from "./utils";
import confetti from "react-confetti";

export default function Main() {
  //state values
  const [currentWord, setCurrentWord] = useState(() => getRandomWord());
  const [guessedLetters, setGuessedLetters] = useState([]);

  // derived values
  const numGuessesLeft = languages.length - 1;
  const wrongGuessesCount = guessedLetters.filter(
    (letter) => !currentWord.includes(letter),
  ).length;
  const isGameWon = currentWord.split("").every((letter) => {
    return guessedLetters.includes(letter);
  });

  const isGameLost = wrongGuessesCount >= numGuessesLeft;
  const isGameOver = isGameWon || isGameLost;

  const lastGuessedLetter = guessedLetters[guessedLetters.length - 1];
  const isLastGuessedIncorrect =
    lastGuessedLetter && !currentWord.includes(lastGuessedLetter);

  // static values
  const alphabets = "abcdefghijklmnopqrstuvwxyz";

  function addGuessedLetter(letter) {
    setGuessedLetters((prevLetters) => {
      return prevLetters.includes(letter)
        ? prevLetters
        : [...prevLetters, letter];
    });
  }

  const languageElements = languages.map((language, index) => {
    const isLanguageLost = index < wrongGuessesCount;
    const styles = {
      backgroundColor: language.backgroundColor,
      color: language.color,
    };
    const className = clsx("chip", isLanguageLost && "lost");

    return (
      <span className={className} style={styles} key={language.name}>
        {language.name}
      </span>
    );
  });

  const letterElements = currentWord.split("").map((letter, index) => {
    const shouldRevealLetter = isGameLost || guessedLetters.includes(letter);
    const letterClassName = clsx(
      isGameLost && !guessedLetters.includes(letter) && "missed-letter",
    );
    return (
      <span key={index} className={letterClassName}>
        {shouldRevealLetter ? letter.toUpperCase() : ""}
      </span>
    );
  });

  const keyboardElements = alphabets.split("").map((letter) => {
    const isGuessed = guessedLetters.includes(letter);
    const isCorrect = isGuessed && currentWord.includes(letter);
    const isWrong = isGuessed && !currentWord.includes(letter);
    const className = clsx({
      correct: isCorrect,
      wrong: isWrong,
    });

    return (
      <button
        className={className}
        key={letter}
        disabled={isGameOver}
        aria-disabled={guessedLetters.includes(letter)}
        aria-label={`Letter ${letter}`}
        onClick={() => {
          return addGuessedLetter(letter);
        }}
      >
        {letter.toUpperCase()}
      </button>
    );
  });

  const gameStatusClass = clsx("game-status", {
    won: isGameWon,
    lost: isGameLost,
    farewell: !isGameOver && isLastGuessedIncorrect,
  });

  function renderGameStatus() {
    if (!isGameOver && isLastGuessedIncorrect) {
      return (
        <p className="farewell-message">
          {getFarewellText(languages[wrongGuessesCount - 1].name)}
        </p>
      );
    }
    if (isGameWon) {
      return (
        <>
          <h3>You Win!</h3>
          <p>Well done! 🎉</p>
        </>
      );
    }
    if (isGameLost) {
      return (
        <>
          <h3>Game over!</h3>
          <p>You lose! Better start learning Assembly!</p>
        </>
      );
    } else {
      return null;
    }
  }

  function handleNewGame() {
    setCurrentWord(getRandomWord());
    setGuessedLetters([]);
  }

  return (
    <main>
      {isGameWon && <confetti recycle={false} numberOfPieces={1000} />}
      <header>
        <h1>Assembly: Endgame</h1>
        <p>
          Guess the word in under 8 attempts to keep the programming world safe
          from Assembly
        </p>
      </header>

      <section aria-live="polite" role="status" className={gameStatusClass}>
        {renderGameStatus()}
      </section>

      <section className="language-chips">{languageElements}</section>

      <section className="word">{letterElements}</section>

      {/* combined visually-hiddden aria-live region for status updates */}

      <section className="sr-only" aria-live="polite" role="status">
        <p>
          {currentWord.includes(lastGuessedLetter)
            ? `Correct! The letter ${lastGuessedLetter} is in the word.`
            : `Sorry, The letter ${lastGuessedLetter} is not in the word.`}
          you have {numGuessesLeft} guesses left.
        </p>

        <p>
          Current word:{" "}
          {currentWord
            .split("")
            .map((letter) =>
              guessedLetters.includes(letter) ? letter + "." : "blank",
            )
            .join(" ")}
        </p>
      </section>

      <section className="keyboard">{keyboardElements}</section>

      {isGameOver && (
        <button className="new-game" onClick={handleNewGame}>
          New Game
        </button>
      )}
    </main>
  );
}
