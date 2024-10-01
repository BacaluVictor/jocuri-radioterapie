const { useState, useEffect } = React;
const { DragDropContext, Droppable, Draggable } = window.ReactBeautifulDnd;

/* Componente UI */
const Alert = ({ children, type }) => (
  <div className={`alert ${type}`}>
    {children}
  </div>
);

const Card = ({ children }) => (
  <div className="card">
    {children}
  </div>
);

const Button = ({ children, onClick, className, disabled }) => (
  <button onClick={onClick} className={`button ${className}`} disabled={disabled}>
    {children}
  </button>
);

const Input = (props) => (
  <input className="input" {...props} />
);

/* Datele pentru organe și constrângeri */
const organConstraintPairs = [
  { organ: "Trunchi cerebral", constraint: "Dmax = 54 Gy (max 60 Gy dacă e necesar)" },
  { organ: "Creier", constraint: "Dmax <60 Gy" },
  { organ: "Chiasma optică, nervii optici", constraint: "Dmax ≤55 Gy" },
  { organ: "Globi oculari", constraint: "Dmax <40 Gy" },
  { organ: "Cohleea", constraint: "Dmean <45 Gy" },
  { organ: "Cristalin", constraint: "Dmax <5 Gy" },
  { organ: "Glanda pituitară (hipofiza)", constraint: "Dmean <36 Gy" },
  { organ: "Hipocamp (pacienți tineri)", constraint: "Dmax ≤16 Gy" },
  { organ: "Constrictori faringieni", constraint: "Dmean <50 Gy" },
  { organ: "Măduvă", constraint: "Dmax <50 Gy" },
  { organ: "Parotidă bilateral", constraint: "Dmean <25 Gy" },
  { organ: "Esofag", constraint: "Dmean <34 Gy" },
  { organ: "Plex brahial", constraint: "Dmax <66 Gy" },
  { organ: "Plămâni", constraint: "V20 ≤20%" },
  { organ: "Cord", constraint: "V30 ≤30%" },
  { organ: "Ficat", constraint: "Dmean <42 Gy" },
  { organ: "Rinichi bilateral", constraint: "V20 <32%, unilateral Dmean <18 Gy" },
  { organ: "Capete femurale", constraint: "V40 <15%; Cap și col femural: 42 Gy" },
  { organ: "Intestin subțire (bowel bag)", constraint: "V15 <120 cc" },
  { organ: "Vezică Urinară", constraint: ["Dmax = 65 Gy", "Dmax <65 Gy"] },
  { organ: "Bulb penian", constraint: "Dmean 95% din organ <50 Gy" }
];

/* Funcție pentru a amesteca elementele dintr-o listă */
const shuffleArray = (array) => {
  let shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/* Jocul Drag and Drop */
const DragAndDropGame = () => {
  const [organs, setOrgans] = useState([]);
  const [constraints, setConstraints] = useState([]);
  const [matches, setMatches] = useState({});
  const [score, setScore] = useState(0);
  const [incorrectDropId, setIncorrectDropId] = useState(null);
  const [flattenedPairs, setFlattenedPairs] = useState([]);
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detectăm dacă utilizatorul este pe un dispozitiv mobil
    setIsMobile(isMobileDevice());

    // Aplatizăm lista de perechi pentru a trata fiecare constrângere individual
    const flattened = [];
    organConstraintPairs.forEach(pair => {
      if (Array.isArray(pair.constraint)) {
        pair.constraint.forEach(constraint => {
          flattened.push({ organ: pair.organ, constraint });
        });
      } else {
        flattened.push(pair);
      }
    });

    setFlattenedPairs(flattened);

    // Extragem organele unice și le amestecăm
    const uniqueOrgans = [...new Set(organConstraintPairs.map(pair => pair.organ))];
    setOrgans(shuffleArray(uniqueOrgans));

    // Creăm constrângerile cu ID-uri unice și le amestecăm
    const constraintsWithIds = flattened.map((pair, index) => ({
      id: 'constraint-' + index,
      constraint: pair.constraint
    }));
    setConstraints(shuffleArray(constraintsWithIds));
  }, []);

  const isMobileDevice = () => {
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    const organName = draggableId;
    const constraintId = destination.droppableId;

    // Găsim constrângerea selectată
    const constraintObj = constraints.find(c => c.id === constraintId);
    if (!constraintObj) return;

    const constraintName = constraintObj.constraint;

    // Găsim toate constrângerile asociate cu organul
    const organConstraints = flattenedPairs
      .filter(pair => pair.organ === organName)
      .map(pair => pair.constraint);

    // Verificăm dacă constrângerea selectată se potrivește cu organul
    const isCorrectMatch = organConstraints.includes(constraintName);

    if (isCorrectMatch) {
      setMatches(prevMatches => ({
        ...prevMatches,
        [organName]: constraintName,
      }));
      setScore(prevScore => prevScore + 1);
      // Eliminăm organul din lista de organe
      setOrgans(prevOrgans => prevOrgans.filter(organ => organ !== organName));
    } else {
      // Afișăm feedback vizual pentru potrivire incorectă
      setIncorrectDropId(constraintId);
      // Eliminăm efectul după o scurtă perioadă de timp
      setTimeout(() => {
        setIncorrectDropId(null);
      }, 500);
    }
  };

  const handleOrganClick = (organ) => {
    setSelectedOrgan(organ);
  };

  const handleConstraintClick = (constraintObj) => {
    if (!selectedOrgan) return;

    const organName = selectedOrgan;
    const constraintName = constraintObj.constraint;

    // Găsim toate constrângerile asociate cu organul
    const organConstraints = flattenedPairs
      .filter(pair => pair.organ === organName)
      .map(pair => pair.constraint);

    // Verificăm dacă constrângerea selectată se potrivește cu organul
    const isCorrectMatch = organConstraints.includes(constraintName);

    if (isCorrectMatch) {
      setMatches(prevMatches => ({
        ...prevMatches,
        [organName]: constraintName,
      }));
      setScore(prevScore => prevScore + 1);
      // Eliminăm organul din lista de organe
      setOrgans(prevOrgans => prevOrgans.filter(organ => organ !== organName));
      setSelectedOrgan(null);
    } else {
      // Afișăm feedback vizual pentru potrivire incorectă
      setIncorrectDropId(constraintObj.id);
      // Eliminăm efectul după o scurtă perioadă de timp
      setTimeout(() => {
        setIncorrectDropId(null);
      }, 500);
      // Resetăm selecția organului
      setSelectedOrgan(null);
    }
  };

  return (
    <div className="container">
      <h2 className="text-2xl font-bold mb-4">Potrivește Organele cu Constrângerile de Doză</h2>
      {isMobile ? (
        // Interacțiune prin tap pe mobil
        <div className="columns">
          <div className="column">
            <h3 className="text-xl font-semibold mb-2">Organe</h3>
            <div className="organs-grid">
              {organs.map((organ) => (
                <div
                  key={organ}
                  className={`draggable-item ${
                    selectedOrgan === organ ? 'selected' : ''
                  }`}
                  onClick={() => handleOrganClick(organ)}
                >
                  <p>{organ}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="column">
            <h3 className="text-xl font-semibold mb-2">Constrângeri de Doză</h3>
            <div className="constraints-grid">
              {constraints.map((constraintObj) => (
                <div
                  key={constraintObj.id}
                  className={`drop-zone ${
                    Object.values(matches).includes(constraintObj.constraint) ? 'correct-match' : ''
                  } ${
                    incorrectDropId === constraintObj.id ? 'incorrect-match' : ''
                  }`}
                  onClick={() => handleConstraintClick(constraintObj)}
                >
                  <div className="constraint-item">{constraintObj.constraint}</div>
                  {/* Afișează organul potrivit dacă există */}
                  {Object.entries(matches).map(([organName, matchedConstraint]) => {
                    if (matchedConstraint === constraintObj.constraint) {
                      return (
                        <div key={organName} className="matched-organ">
                          {organName}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Interacțiune prin drag and drop pe desktop
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="columns">
            <div className="column">
              <h3 className="text-xl font-semibold mb-2">Organe</h3>
              <Droppable droppableId="organs">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="organs-grid">
                    {organs.map((organ, index) => (
                      <Draggable
                        key={organ}
                        draggableId={organ}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="draggable-item"
                          >
                            <p>{organ}</p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
            <div className="column">
              <h3 className="text-xl font-semibold mb-2">Constrângeri de Doză</h3>
              <div className="constraints-grid">
                {constraints.map((constraintObj, index) => (
                  <Droppable key={constraintObj.id} droppableId={constraintObj.id}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`drop-zone ${
                          Object.values(matches).includes(constraintObj.constraint) ? 'correct-match' : ''
                        } ${
                          incorrectDropId === constraintObj.id ? 'incorrect-match' : ''
                        }`}
                      >
                        <div className="constraint-item">{constraintObj.constraint}</div>
                        {/* Afișează organul potrivit dacă există */}
                        {Object.entries(matches).map(([organName, matchedConstraint]) => {
                          if (matchedConstraint === constraintObj.constraint) {
                            return (
                              <div key={organName} className="matched-organ">
                                {organName}
                              </div>
                            );
                          }
                          return null;
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </div>
          </div>
        </DragDropContext>
      )}
      <div className="mt-4 score">
        <p className="font-semibold">Scor: {score} / {flattenedPairs.length}</p>
      </div>
    </div>
  );
};

/* Jocul "Mai bagă o fișă" */
const AnswerGame = () => {
  // Codul pentru jocul "Mai bagă o fișă"

  const [organData, setOrganData] = useState([]);
  const [currentOrgan, setCurrentOrgan] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [incorrectAnswers, setIncorrectAnswers] = useState([]);
  const [canProceed, setCanProceed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const shuffledData = shuffleArray(organConstraintPairs);
    setOrganData(shuffledData);
    setScore(0);
    setQuestionCount(0);
    setGameEnded(false);
    setIncorrectAnswers([]);
    newQuestion(shuffledData);
  };

  const newQuestion = (data = organData) => {
    if (questionCount < data.length) {
      setCurrentOrgan(data[questionCount]);
      setUserInput('');
      setFeedback('');
      setShowAnswer(false);
      setCanProceed(false);
      setIsCorrect(false);
      setQuestionCount(questionCount + 1);
    } else {
      setGameEnded(true);
    }
  };

  const normalizeAnswer = (answer) => {
    return answer.toLowerCase()
      .replace(/≤/g, '<')
      .replace(/<=/g, '<')
      .replace(/\s+/g, '')
      .replace(/gy/g, 'gy')
      .replace(/cc/g, 'cc')
      .replace(/[.,]/g, '');
  };

  const getRandomFeedback = (isCorrect) => {
    const correctResponses = [
      "Răspuns corect! Felicitări!",
      "Bine făcut!",
      "Exact!",
      "Ai răspuns corect!",
      "Bravo!",
      "Corect!",
      "Răspunsul este corect!",
      "Foarte bine!",
      "Super!",
      "Continuă tot așa!"
    ];

    const incorrectResponses = [
      "Răspuns incorect.",
      "Mai încearcă.",
      "Nu este corect.",
      "Din păcate, nu acesta este răspunsul.",
      "Nu ai răspuns corect.",
      "Încă puțin și vei reuși.",
      "Aproape, dar nu este corect.",
      "Poate data viitoare.",
      "Nu este răspunsul corect.",
      "Să încercăm următoarea întrebare."
    ];

    const responses = isCorrect ? correctResponses : incorrectResponses;
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const checkAnswer = () => {
    const userAnswer = normalizeAnswer(userInput);
    let isAnswerCorrect = false;

    if (Array.isArray(currentOrgan.constraint)) {
      isAnswerCorrect = currentOrgan.constraint.some(constraint => 
        normalizeAnswer(constraint).includes(userAnswer) && userAnswer.length > 3
      );
    } else {
      const correctAnswer = normalizeAnswer(currentOrgan.constraint);
      isAnswerCorrect = correctAnswer.includes(userAnswer) && userAnswer.length > 3;
    }

    if (isAnswerCorrect) {
      setScore(score + 1);
      setFeedback(getRandomFeedback(true));
      setIsCorrect(true);
    } else {
      setFeedback(getRandomFeedback(false));
      setIncorrectAnswers([...incorrectAnswers, { organ: currentOrgan.organ, correct: currentOrgan.constraint, user: userInput }]);
      setIsCorrect(false);
    }
    setCanProceed(true);
  };

  const showCorrectAnswer = () => {
    setShowAnswer(true);
    setCanProceed(true);
  };

  if (gameEnded) {
    return (
      <div className="container">
        <Card>
          <div className="card-header">
            <h2 className="card-title">Joc Terminat!</h2>
          </div>
          <div className="card-content">
            <Alert type="info">
              <p>Ai răspuns corect la {score} din {organData.length} întrebări. Felicitări!</p>
            </Alert>
            {incorrectAnswers.length > 0 && (
              <div>
                <h3>Răspunsuri incorecte:</h3>
                <ul className="list">
                  {incorrectAnswers.map((item, index) => (
                    <li key={index} className="list-item">
                      <strong>{item.organ}:</strong> Ai răspuns "{item.user}", dar răspunsul corect este "{Array.isArray(item.correct) ? item.correct.join('" sau "') : item.correct}".
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="card-footer">
            <Button onClick={startNewGame} className="primary w-full">
              Începe un joc nou
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container">
      <Card>
        <div className="card-header">
          <h2 className="card-title">Mai bagă o fișă</h2>
        </div>
        <div className="card-content">
          <Alert type="info">
            <p>
              Includeți unitățile de măsură (Gy, cc). Nu contează spațiile sau literele mari/mici.
              Puteți folosi "&lt;" sau "≤".
            </p>
          </Alert>
          <div className="text-center">
            <p>Scor: {score} / {questionCount - 1}</p>
          </div>
          {currentOrgan && (
            <div>
              <p>Care este constrângerea de doză pentru <strong>{currentOrgan.organ}</strong>?</p>
              <Input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Scrie aici răspunsul"
              />
              <div className="button-group">
                <Button onClick={checkAnswer} className="primary" disabled={canProceed}>
                  Verifică răspunsul
                </Button>
                <Button onClick={showCorrectAnswer} className="secondary" disabled={canProceed}>
                  Arată răspunsul
                </Button>
                {canProceed && (
                  <Button onClick={() => newQuestion()} className="success">
                    Următoarea întrebare
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="card-footer">
          {feedback && (
            <Alert type={isCorrect ? 'success' : 'error'}>
              <p>{feedback}</p>
            </Alert>
          )}
          {showAnswer && (
            <Alert type="info">
              <p>Răspunsul corect: {Array.isArray(currentOrgan.constraint) 
                ? currentOrgan.constraint.join(' sau ')
                : currentOrgan.constraint}</p>
            </Alert>
          )}
        </div>
      </Card>
    </div>
  );
};

/* Componenta Principală */
const App = () => {
  const [activeTab, setActiveTab] = useState('game1');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div>
      <div className="tabs">
        <div
          className={`tab ${activeTab === 'game1' ? 'active' : ''}`}
          onClick={() => handleTabChange('game1')}
        >
          Joc Drag and Drop
        </div>
        <div
          className={`tab ${activeTab === 'game2' ? 'active' : ''}`}
          onClick={() => handleTabChange('game2')}
        >
          Mai bagă o fișă
        </div>
      </div>
      {activeTab === 'game1' && <DragAndDropGame />}
      {activeTab === 'game2' && <AnswerGame />}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
