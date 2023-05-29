import './App.css';
import { BoidsCanvas } from './components/BoidsCanvas/BoidsCanvas';

function App() {
  return (
    <div className='App'>
      <div>
        <h1>2D Boids Experiment</h1>

        <p style={{ width: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
          <i>
            {`"Boids is an artificial life program, developed by Craig Reynolds in 1986, which
            simulates the flocking behaviour of birds. His paper on this topic was published in 1987
            in the proceedings of the ACM SIGGRAPH conference. The name "boid" corresponds to a
            shortened version of "bird-oid object", which refers to a bird-like object."`}
          </i>
        </p>
        <p>
          You can read more about it from the{' '}
          <a href='https://en.wikipedia.org/wiki/Boids'>wikipedia page here.</a>
        </p>

        <br />

        <div style={{ width: '80%', height: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          <BoidsCanvas fpsLimit={60} fpsDisplay />
        </div>

        <br />

        <p style={{ width: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
          This was an experiment I ran to have some fun playing around with the mathematical concept
          of Boids, as well as to brush up on some of my programming & trigonometry skills :)
          If you like this, feel free to check out some of my other work at my website:
          <br />
          <a href='https://www.amaroklopcic.com'>www.amaroklopcic.com</a>
        </p>
      </div>
    </div>
  );
}

export default App;
