export interface PIDGains {
  kp: number;
  ki: number;
  kd: number;
}

export class PIDController {
  private gains: PIDGains;
  private integral = 0;
  private previousError = 0;

  constructor(gains: PIDGains) {
    this.gains = gains;
  }

  setGains(gains: PIDGains): void {
    this.gains = gains;
  }

  calculate(setpoint: number, current: number, dt: number): number {
    const error = setpoint - current;
    this.integral += error * dt;
    const derivative = (error - this.previousError) / dt;
    this.previousError = error;
    return this.gains.kp * error + this.gains.ki * this.integral + this.gains.kd * derivative;
  }

  reset(): void {
    this.integral = 0;
    this.previousError = 0;
  }
}
