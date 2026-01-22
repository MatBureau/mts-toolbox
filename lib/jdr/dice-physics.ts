export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface DiceState {
  position: Vector3;
  velocity: Vector3;
  rotation: Vector3;
  angularVelocity: Vector3;
  result: number;
  isStable: boolean;
}

export function createInitialDiceState(result: number): DiceState {
  return {
    position: { x: (Math.random() - 0.5) * 2, y: 5 + Math.random() * 2, z: (Math.random() - 0.5) * 2 },
    velocity: { x: (Math.random() - 0.5) * 4, y: -2 - Math.random() * 5, z: (Math.random() - 0.5) * 4 },
    rotation: { x: Math.random() * Math.PI, y: Math.random() * Math.PI, z: Math.random() * Math.PI },
    angularVelocity: { x: Math.random() * 10, y: Math.random() * 10, z: Math.random() * 10 },
    result,
    isStable: false
  };
}

export function updateDicePhysics(state: DiceState, dt: number): DiceState {
  if (state.isStable) return state;

  const newState = { ...state };
  const gravity = -9.81;
  const bounce = 0.5;
  const friction = 0.98;

  // Position update
  newState.velocity.y += gravity * dt;
  newState.position.x += newState.velocity.x * dt;
  newState.position.y += newState.velocity.y * dt;
  newState.position.z += newState.velocity.z * dt;

  // Floor collision (y = 0)
  if (newState.position.y < 0.5) {
    newState.position.y = 0.5;
    newState.velocity.y *= -bounce;
    newState.velocity.x *= friction;
    newState.velocity.z *= friction;
    newState.angularVelocity.x *= friction;
    newState.angularVelocity.y *= friction;
    newState.angularVelocity.z *= friction;
  }

  // Rotation update
  newState.rotation.x += newState.angularVelocity.x * dt;
  newState.rotation.y += newState.angularVelocity.y * dt;
  newState.rotation.z += newState.angularVelocity.z * dt;

  // Stability check
  const speed = Math.sqrt(newState.velocity.x**2 + newState.velocity.y**2 + newState.velocity.z**2);
  const angSpeed = Math.sqrt(newState.angularVelocity.x**2 + newState.angularVelocity.y**2 + newState.angularVelocity.z**2);

  if (speed < 0.1 && angSpeed < 0.1 && newState.position.y <= 0.51) {
    newState.isStable = true;
    // Forcer la rotation finale pour correspondre au résultat
    // (Simplification : on laisse l'animation se stabiliser puis on ajuste si besoin)
  }

  return newState;
}

export function getFinalRotationForDice(result: number): Vector3 {
  const rotations: Record<number, Vector3> = {
    1: { x: 0, y: 0, z: 0 },
    2: { x: 0, y: Math.PI / 2, z: 0 },
    3: { x: -Math.PI / 2, y: 0, z: 0 },
    4: { x: Math.PI / 2, y: 0, z: 0 },
    5: { x: 0, y: -Math.PI / 2, z: 0 },
    6: { x: Math.PI, y: 0, z: 0 },
  };
  return rotations[result] || rotations[1];
}
