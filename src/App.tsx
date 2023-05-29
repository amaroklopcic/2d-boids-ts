import './App.css';
import { BoidsCanvas } from './components/BoidsCanvas/BoidsCanvas';

function App() {
  return (
    <div className='App'>
      <div>
        <p>
          Boids are cool.
        </p>
        <div style={{ width: '80%', height: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          <BoidsCanvas fpsLimit={60} fpsDisplay />
        </div>
      </div>
    </div>
  );
}

export default App;
