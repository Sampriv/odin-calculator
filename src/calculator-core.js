export const DIVIDE_BY_ZERO_MESSAGE = "Nice try. Math says nope.";

const MAX_INPUT_LENGTH = 15;
const MAX_DISPLAY_LENGTH = 16;

const OPERATOR_MAP = new Map([
  ["+", "+"],
  ["−", "−"],
  ["-", "−"],
  ["×", "×"],
  ["*", "×"],
  ["x", "×"],
  ["X", "×"],
  ["÷", "÷"],
  ["/", "÷"]
]);

export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

export function multiply(a, b) {
  return a * b;
}

export function divide(a, b) {
  return a / b;
}

export function normalizeOperator(operator) {
  return OPERATOR_MAP.get(String(operator)) ?? null;
}

export function operate(operator, firstNumber, secondNumber) {
  const normalized = normalizeOperator(operator);

  switch (normalized) {
    case "+":
      return add(firstNumber, secondNumber);
    case "−":
      return subtract(firstNumber, secondNumber);
    case "×":
      return multiply(firstNumber, secondNumber);
    case "÷":
      return divide(firstNumber, secondNumber);
    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
}

export function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return DIVIDE_BY_ZERO_MESSAGE;
  }

  const rounded = Number.parseFloat(value.toPrecision(12));
  const normalized = Object.is(rounded, -0) ? 0 : rounded;
  let displayValue = String(normalized);

  if (
    displayValue.length > MAX_DISPLAY_LENGTH ||
    Math.abs(normalized) >= 1e12 ||
    (Math.abs(normalized) > 0 && Math.abs(normalized) < 1e-7)
  ) {
    displayValue = normalized.toExponential(6).replace(/\.?0+e/, "e");
  }

  return displayValue;
}

export class Calculator {
  constructor() {
    this.clear();
  }

  clear() {
    this.displayValue = "0";
    this.firstOperand = null;
    this.operator = null;
    this.waitingForSecondOperand = false;
    this.justCalculated = false;
    this.error = false;
    this.history = "";

    return this.snapshot();
  }

  snapshot() {
    return {
      displayValue: this.displayValue,
      firstOperand: this.firstOperand,
      operator: this.operator,
      waitingForSecondOperand: this.waitingForSecondOperand,
      justCalculated: this.justCalculated,
      error: this.error,
      history: this.history
    };
  }

  inputDigit(digit) {
    const nextDigit = String(digit);

    if (!/^\d$/.test(nextDigit)) {
      return this.snapshot();
    }

    if (this.shouldStartFreshNumber()) {
      this.resetForNewCalculation(nextDigit);
      return this.snapshot();
    }

    if (this.waitingForSecondOperand) {
      this.displayValue = nextDigit;
      this.waitingForSecondOperand = false;
      this.justCalculated = false;
      return this.snapshot();
    }

    if (this.displayValue.length >= MAX_INPUT_LENGTH) {
      return this.snapshot();
    }

    this.displayValue = this.displayValue === "0" ? nextDigit : `${this.displayValue}${nextDigit}`;
    this.justCalculated = false;

    return this.snapshot();
  }

  inputOperator(nextOperator) {
    const normalizedOperator = normalizeOperator(nextOperator);

    if (!normalizedOperator) {
      return this.snapshot();
    }

    if (this.error) {
      this.clear();
    }

    const inputValue = this.currentDisplayNumber();

    if (this.operator && this.waitingForSecondOperand) {
      this.operator = normalizedOperator;
      this.history = `${formatNumber(this.firstOperand)} ${this.operator}`;
      return this.snapshot();
    }

    if (this.firstOperand === null) {
      this.firstOperand = inputValue;
    } else if (this.operator) {
      const previousOperator = this.operator;
      const previousFirstOperand = this.firstOperand;
      const result = this.evaluate(inputValue);

      this.history = `${formatNumber(previousFirstOperand)} ${previousOperator} ${formatNumber(inputValue)} =`;

      if (this.error) {
        return this.snapshot();
      }

      this.displayValue = formatNumber(result);
      this.firstOperand = Number(this.displayValue);
    }

    this.operator = normalizedOperator;
    this.waitingForSecondOperand = true;
    this.justCalculated = false;
    this.history = `${this.displayValue} ${this.operator}`;

    return this.snapshot();
  }

  calculateResult() {
    if (this.error || this.firstOperand === null || this.operator === null || this.waitingForSecondOperand) {
      return this.snapshot();
    }

    const secondOperand = this.currentDisplayNumber();
    const previousOperator = this.operator;
    const previousFirstOperand = this.firstOperand;
    const result = this.evaluate(secondOperand);

    this.history = `${formatNumber(previousFirstOperand)} ${previousOperator} ${formatNumber(secondOperand)} =`;

    if (this.error) {
      return this.snapshot();
    }

    this.displayValue = formatNumber(result);
    this.firstOperand = null;
    this.operator = null;
    this.waitingForSecondOperand = false;
    this.justCalculated = true;

    return this.snapshot();
  }

  press(key) {
    const value = String(key);

    if (/^\d$/.test(value)) {
      return this.inputDigit(value);
    }

    if (value === "=") {
      return this.calculateResult();
    }

    if (value === "Clear" || value === "C") {
      return this.clear();
    }

    if (normalizeOperator(value)) {
      return this.inputOperator(value);
    }

    return this.snapshot();
  }

  shouldStartFreshNumber() {
    return this.error || (this.justCalculated && this.operator === null && !this.waitingForSecondOperand);
  }

  resetForNewCalculation(displayValue) {
    this.displayValue = displayValue;
    this.firstOperand = null;
    this.operator = null;
    this.waitingForSecondOperand = false;
    this.justCalculated = false;
    this.error = false;
    this.history = "";
  }

  currentDisplayNumber() {
    return Number(this.displayValue);
  }

  evaluate(secondOperand) {
    if (this.operator === "÷" && secondOperand === 0) {
      this.displayValue = DIVIDE_BY_ZERO_MESSAGE;
      this.firstOperand = null;
      this.operator = null;
      this.waitingForSecondOperand = false;
      this.justCalculated = true;
      this.error = true;
      return null;
    }

    return operate(this.operator, this.firstOperand, secondOperand);
  }
}
