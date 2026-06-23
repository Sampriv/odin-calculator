import assert from "node:assert/strict";
import test from "node:test";
import {
  Calculator,
  DIVIDE_BY_ZERO_MESSAGE,
  add,
  divide,
  formatNumber,
  multiply,
  operate,
  subtract
} from "../src/calculator-core.js";

function enter(keys) {
  const calculator = new Calculator();

  keys.forEach((key) => calculator.press(key));

  return calculator.snapshot();
}

test("basic operator functions return expected values", () => {
  assert.equal(add(2, 3), 5);
  assert.equal(subtract(9, 4), 5);
  assert.equal(multiply(6, 7), 42);
  assert.equal(divide(12, 3), 4);
});

test("operate dispatches to the correct arithmetic function", () => {
  assert.equal(operate("+", 8, 2), 10);
  assert.equal(operate("−", 8, 2), 6);
  assert.equal(operate("*", 8, 2), 16);
  assert.equal(operate("/", 8, 2), 4);
});

test("happy path button sequences work for all basic operators", () => {
  assert.equal(enter(["2", "+", "3", "="]).displayValue, "5");
  assert.equal(enter(["9", "-", "4", "="]).displayValue, "5");
  assert.equal(enter(["6", "*", "7", "="]).displayValue, "42");
  assert.equal(enter(["1", "2", "/", "3", "="]).displayValue, "4");
});

test("calculator evaluates one pair at a time when chaining operations", () => {
  const calculator = new Calculator();

  ["1", "2", "+", "7", "-"].forEach((key) => calculator.press(key));
  assert.equal(calculator.snapshot().displayValue, "19");

  ["1", "="].forEach((key) => calculator.press(key));
  assert.equal(calculator.snapshot().displayValue, "18");
});

test("long decimal answers are rounded for display", () => {
  assert.equal(formatNumber(0.1 + 0.2), "0.3");
  assert.equal(enter(["1", "/", "3", "="]).displayValue, "0.333333333333");
});

test("equals before a full operation does not change the display", () => {
  assert.equal(enter(["2", "="]).displayValue, "2");
  assert.equal(enter(["2", "+", "="]).displayValue, "2");
});

test("clear wipes display and stored calculator state", () => {
  const calculator = new Calculator();

  ["8", "+", "9", "Clear"].forEach((key) => calculator.press(key));

  assert.deepEqual(calculator.snapshot(), {
    displayValue: "0",
    firstOperand: null,
    operator: null,
    waitingForSecondOperand: false,
    justCalculated: false,
    error: false,
    history: ""
  });
});

test("division by zero shows an error without crashing", () => {
  const calculator = new Calculator();

  ["9", "/", "0", "="].forEach((key) => calculator.press(key));
  assert.equal(calculator.snapshot().displayValue, DIVIDE_BY_ZERO_MESSAGE);
  assert.equal(calculator.snapshot().error, true);

  calculator.press("4");
  assert.equal(calculator.snapshot().displayValue, "4");
  assert.equal(calculator.snapshot().error, false);
});

test("consecutive operators replace the pending operator without evaluating", () => {
  assert.equal(enter(["2", "+", "*", "3", "="]).displayValue, "6");
});

test("typing a digit after a result starts a new calculation", () => {
  const calculator = new Calculator();

  ["2", "+", "3", "="].forEach((key) => calculator.press(key));
  assert.equal(calculator.snapshot().displayValue, "5");

  calculator.press("7");
  assert.equal(calculator.snapshot().displayValue, "7");
});
