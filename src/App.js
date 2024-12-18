import React, { useState, useEffect } from 'react';
import './App.css';

const colors = ["red", "blue", "green", "yellow", "orange", "purple"];

const generateSecretCode = (length = 4) => {
  const shuffledColors = [...colors].sort(() => Math.random() - 0.5);
  return shuffledColors.slice(0, length);
};

const App = () => {
  const [playerName, setPlayerName] = useState('');
  const [secretCode, setSecretCode] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState(Array(4).fill(null));
  const [gameStarted, setGameStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [draggedColor, setDraggedColor] = useState(null);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showShareButton, setShowShareButton] = useState(false);

  useEffect(() => {
    if (gameStarted) {
      const interval = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [gameStarted]);

  const startGame = () => {
    setSecretCode(generateSecretCode());
    setGuesses([]);
    setCurrentGuess(Array(4).fill(null));
    setTimeElapsed(0);
    setScore(0);
    setGameStarted(true);
    setShowShareButton(false); // Resetar o botão de compartilhamento
  };

  const handleGuess = () => {
    const feedback = generateFeedback(currentGuess);
    setGuesses([...guesses, { guess: [...currentGuess], feedback }]);

    if (feedback.correct === secretCode.length) {
      setShowWinModal(true); // Mostrar modal de vitória
      setGameStarted(false);
      setHighScore(Math.max(score, highScore));
      setShowShareButton(true); // Habilitar botão de compartilhamento
    } else {
      setScore(score + 10);
    }

    setCurrentGuess(Array(4).fill(null));
  };

  const generateFeedback = (guess) => {
    let correct = 0, misplaced = 0;
    const codeCopy = [...secretCode];
    const guessCopy = [...guess];
    const incorrectColors = [];

    guessCopy.forEach((color, index) => {
      if (color === codeCopy[index]) {
        correct++;
        codeCopy[index] = null;
        guessCopy[index] = null;
      }
    });

    guessCopy.forEach((color, index) => {
      if (color && codeCopy.includes(color)) {
        misplaced++;
        const codeIndex = codeCopy.indexOf(color);
        codeCopy[codeIndex] = null;
        guessCopy[index] = null;
      }
    });

    guessCopy.forEach(color => {
      if (color && !secretCode.includes(color) && incorrectColors.length < 2) {
        incorrectColors.push(color);
      }
    });

    const incorrect = incorrectColors.length;
    return { correct, misplaced, incorrect };
  };

  const shareScore = () => {
    const url = `https://twitter.com/intent/tweet?text=Consegui%20${score}%20pontos%20no%20Mastermind!`;
    window.open(url, '_blank');
  };

  const handleDragStart = (color) => {
    setDraggedColor(color);
  };

  const handleDrop = (index) => {
    const newGuess = [...currentGuess];
    newGuess[index] = draggedColor;
    setCurrentGuess(newGuess);
    setDraggedColor(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handlePlayerNameChange = (e) => {
    setPlayerName(e.target.value);
  };

  return (
    <div className="app">
      {gameStarted ? (
        <div className="game-screen">
          <h1>Mastermind</h1>
          <p>Jogador: {playerName}</p>
          <p>Tempo: {timeElapsed}s</p>
          <p>Pontuação: {score}</p>
          <p>Maior pontuação: {highScore}</p>
          <div className="main-content">
            <div className="game-board">
              {guesses.map((attempt, index) => (
                <div key={index} className="attempt">
                  <div className="guess-row">
                    {attempt.guess.map((color, i) => (
                      <div key={i} className={`peg ${color}`}></div>
                    ))}
                  </div>
                  <div className="feedback">
                    🎯 {attempt.feedback.correct} corretas, 🔄 {attempt.feedback.misplaced} fora de lugar, ❌ {attempt.feedback.incorrect} incorretas
                  </div>
                </div>
              ))}
            </div>
            <div className="guess-input">
              <div className="current-guess">
                {currentGuess.map((color, index) => (
                  <div
                    key={index}
                    className={`guess-slot ${color || ''}`}
                    onDrop={() => handleDrop(index)}
                    onDragOver={handleDragOver}
                  ></div>
                ))}
              </div>
              <button onClick={handleGuess} disabled={currentGuess.includes(null)}>
                Enviar tentativa
              </button>
            </div>
            <div className="colors">
              <div className="color-row">
                {colors.slice(0, 3).map(color => (
                  <div
                    key={color}
                    className={`color-button ${color}`}
                    draggable
                    onDragStart={() => handleDragStart(color)}
                  ></div>
                ))}
              </div>
              <div className="color-row">
                {colors.slice(3).map(color => (
                  <div
                    key={color}
                    className={`color-button ${color}`}
                    draggable
                    onDragStart={() => handleDragStart(color)}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="splash-screen">
          <h1 className="splash-title">Bem-vindo ao Mastermind</h1>
          <p className="splash-subtitle">Descubra o código secreto com o menor número de tentativas!</p>
          <input
            type="text"
            placeholder="Digite seu nome"
            value={playerName}
            onChange={handlePlayerNameChange}
            className="player-input"
          />
          <button
            onClick={startGame}
            disabled={!playerName.trim()}
            className="start-button"
          >
            Iniciar Jogo
          </button>
        </div>
      )}

      {showWinModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>Parabéns, {playerName}! Acertou a combinação em {timeElapsed} segundos!</p>
            <div className="button-container">
              {showShareButton && (
                <button onClick={shareScore}>Compartilhar Pontuação</button>
              )}
              <button onClick={() => setShowWinModal(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
