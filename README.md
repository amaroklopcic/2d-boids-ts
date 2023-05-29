# 2D Boids Experiment (written in TypeScript)

An excerpt from the [Boids wikipedia article](https://en.wikipedia.org/wiki/Boids):

> Boids is an artificial life program, developed by Craig Reynolds in 1986, which simulates the flocking behaviour of birds. His paper on this topic was published in 1987 in the proceedings of the ACM SIGGRAPH conference. The name "boid" corresponds to a shortened version of "bird-oid object", which refers to a bird-like object.
>
> As with most artificial life simulations, Boids is an example of emergent behavior; that is, the complexity of Boids arises from the interaction of individual agents (the boids, in this case) adhering to a set of simple rules. The rules applied in the simplest Boids world are as follows:
>
> - separation: steer to avoid crowding local flockmates
> - alignment: steer towards the average heading of local flockmates
> - cohesion: steer to move towards the average position (center of mass) of local flockmates

This was an experiment I ran to have some fun playing around with the artificial life concept of
Boids, as well as to brush up on some of my programming & trigonometry skills :)

I got the idea & inspiration from [Sebatian Lague.](https://www.youtube.com/watch?v=bqtqltqcQhw)

## Features

- implemented Boid separation, alignment, and cohesion
- canvas bounds avoidance
- fish tail effect for a more alive feel
- a basic event loop to handle redrawing frames using the [JavaScript Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- simulation start & stop buttons (stopping and restarting effectively resets the simulation)

## Development Quickstart

1. Start by cloning the repository locally

```bash
git clone https://github.com/amaroklopcic/2d-boids-ts
```

2. Install the required NPM dependencies

```bash
npm install
```

3. Start the application

```bash
npm start
```
