import './App.css';
import { BoidsCanvas } from './components/BoidsCanvas/BoidsCanvas';

function App() {
  return (
    <div className="App">
      <BoidsCanvas width={1000} height={800} fpsLimit={60} fpsDisplay />
    </div>
  );
}

export default App;
