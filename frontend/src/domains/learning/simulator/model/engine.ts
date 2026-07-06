export interface RobotState {
  x: number;
  y: number;
  heading: number;
  speed: number;
}

export function createRobot(x = 0, y = 0): RobotState {
  return { x, y, heading: 0, speed: 0 };
}

export function moveForward(state: RobotState, distance: number): RobotState {
  const rad = (state.heading * Math.PI) / 180;
  return { ...state, x: state.x + distance * Math.cos(rad), y: state.y + distance * Math.sin(rad) };
}

export function rotate(state: RobotState, degrees: number): RobotState {
  return { ...state, heading: (state.heading + degrees + 360) % 360 };
}

export function setSpeed(state: RobotState, speed: number): RobotState {
  return { ...state, speed: Math.max(0, Math.min(100, speed)) };
}
