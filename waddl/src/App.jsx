import { useState } from 'react'
import and from './assets/and.svg'
import or from './assets/or.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  const [text, setText] = useState('');
  const [submittedText, setSubmittedText] = useState('');

  const handleChange = (event) => {
    setText(event.target.value);
  };

  const handleSubmit = () => {
    setSubmittedText(text);
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={and} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={or} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <h1>Enter your text below</h1>
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Type something..."
      />
      <button onClick={handleSubmit}>Submit</button>
      <div>
        <h2>Submitted Text:</h2>
        <p>{submittedText}</p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
