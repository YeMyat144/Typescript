import { useCallback, useEffect, useState } from "react";
import { HangmanDrawing } from "./HangmanDrawing";
import { HangmanWord } from "./HangmanWord";
import { Keyboard } from "./Keyboard";
import words from "./wordList.json";
import { Container, Row, Col, Alert, Form, Button } from 'react-bootstrap';

interface FormControlElement extends HTMLInputElement {}
import 'bootstrap/dist/css/bootstrap.min.css';

type Difficulty = 'easy' | 'medium' | 'hard';

function getWord(difficulty: Difficulty) {
  const filteredWords = words.filter(word => {
    switch (difficulty) {
      case 'easy': return word.length <= 5;
      case 'medium': return word.length <= 8;
      case 'hard': return word.length > 8;
      default: return true;
    }
  });
  return filteredWords[Math.floor(Math.random() * filteredWords.length)];
}

function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [wordToGuess, setWordToGuess] = useState(getWord('easy'));
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);

  const incorrectLetters = guessedLetters.filter(
    letter => !wordToGuess.includes(letter)
  );



  const isLoser = incorrectLetters.length >= 6;
  const isWinner = wordToGuess
    .split("")
    .every(letter => guessedLetters.includes(letter));

  const addGuessedLetter = useCallback(
    (letter: string) => {
      if (guessedLetters.includes(letter) || isLoser || isWinner) return;

      setGuessedLetters(currentLetters => [...currentLetters, letter]);
    },
    [guessedLetters, isWinner, isLoser]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key;
      if (!key.match(/^[a-z]$/)) return;

      e.preventDefault();
      addGuessedLetter(key);
    };

    document.addEventListener("keypress", handler);

    return () => {
      document.removeEventListener("keypress", handler);
    };
  }, [guessedLetters]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key;
      if (key !== "Enter") return;

      e.preventDefault();
      setGuessedLetters([]);
      setWordToGuess(getWord(difficulty));
    };

    document.addEventListener("keypress", handler);

    return () => {
      document.removeEventListener("keypress", handler);
    };
  }, [difficulty]);

  const handleDifficultyChange = (e: React.ChangeEvent<FormControlElement>) => {
    const newDifficulty = e.target.value as Difficulty;
    setDifficulty(newDifficulty);
    setWordToGuess(getWord(newDifficulty));
    setGuessedLetters([]);
  };

  return (
    <Container className="d-flex flex-column align-items-center mt-5">
      <Row className="mb-4">
        <Col xs="auto">
          <Form.Group controlId="difficultySelect">
            <Form.Label>Select Difficulty</Form.Label>
            <Form.Control as="select" value={difficulty} onChange={handleDifficultyChange}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col xs="auto">
          <HangmanDrawing numberOfGuesses={incorrectLetters.length} />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col xs="auto">
          <HangmanWord
            reveal={isLoser}
            guessedLetters={guessedLetters}
            wordToGuess={wordToGuess}
          />
        </Col>
      </Row>
      <div style={{ alignSelf: "stretch" }}>
        <Keyboard
          disabled={isWinner || isLoser}
          activeLetters={guessedLetters.filter(letter =>
            wordToGuess.includes(letter)
          )}
          inactiveLetters={incorrectLetters}
          addGuessedLetter={addGuessedLetter}
        />
      </div>
      <br />
  
      <Row className="mb-4">
        <Col xs="auto">
          <Alert variant={isWinner ? "success" : isLoser ? "danger" : "light"} className="text-center">
            {isWinner && "Winner! - Refresh to try again"}
            {isLoser && "Nice Try - Refresh to try again"}
          </Alert>
        </Col>
      </Row>
    </Container>
    
  );
}

export default App;
