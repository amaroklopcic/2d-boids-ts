export class Vector2D {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /** Add vectors `a` and `b`. */
  static add(a: Vector2D, b: Vector2D) {
    return new Vector2D(a.x + b.x, a.y + b.y);
  }

  /** Subtract vector `b` from `a`. */
  static subtract(a: Vector2D, b: Vector2D) {
    return new Vector2D(a.x - b.x, a.y - b.y);
  }

  /** Returns the distance between `a` and `b`. */
  static distance(a: Vector2D, b: Vector2D) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  /** Returns the dot product of two vectors.
   *
   * The dot product is a float value equal to the magnitudes of the two
   * vectors multiplied together and then multiplied by the cosine of the
   * angle between them.
   */
  static dot(a: Vector2D, b: Vector2D) {
    return a.x * b.x + a.y * b.y;
  }

  /** Returns the "pseudo-cross product" or "cross product magnitude"
   * which is the magnitude of the cross product of the 3D vectors formed by
   * the original 2D vectors and their Z-components set to zero. The magnitude
   * of this pseudo-cross product can give you useful information about the
   * relative orientations of the vectors.
   */
  static cross(a: Vector2D, b: Vector2D) {
    return a.x * b.y - a.y * b.x;
  }

  /** Returns the length of this vector.
   *
   * The length of the vector is square root of (x*x + y*y).
   */
  magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  /** Returns this vector with a magnitude of 1. */
  normalize() {
    const mag = this.magnitude();
    return new Vector2D(this.x / mag, this.y / mag);
  }

  /** Checks if this vector is normalized. */
  isNormalized() {
    const mag = this.magnitude();
    return mag > 0.99 && mag < 1.01;
  }
}

/** Calculates an average vector position from a list of vectors. */
export function getVectorsAverage(vectors: Vector2D[]) {
  let vectorTotal = new Vector2D(0, 0);
  for (let i = 0; i < vectors.length; i++) {
    vectorTotal = Vector2D.add(vectors[i], vectorTotal);
  }
  return new Vector2D(vectorTotal.x / vectors.length, vectorTotal.y / vectors.length);
}

/** Converts degrees to radians. */
export function deg2Rad(degree: number) {
  return degree * (Math.PI / 180);
}

/** Converts radians to degrees. */
export function rad2Deg(radians: number) {
  return (radians * 180) / Math.PI;
}

/** Linearly interpolates between a and b by t. */
export function lerp(a: number, b: number, t: number) {
  return a * t + b * (1 - t);
}

/** Clamps the given value between the given minimum float and maximum float
 * values. Returns the given value if it is within the minimum and maximum
 * range.
 */
export function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

/** Returns the signed version of `angle` to a range of (-180 through 180). */
export function signAngle(angle: number) {
  return signedMod(angle + 180, 360) - 180;
}

/** returns the signed version of `angle` to a range of (0 through 360). */
export function signAngle2(angle: number) {
  return Math.abs(angle) % 360;
}

export function signedMod(a: number, n: number) {
  return a - Math.floor(a / n) * n;
}
