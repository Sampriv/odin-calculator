import { Calculator, normalizeOperator } from "./calculator-core.js";

const calculator = new Calculator();
const display = document.querySelector("[data-display]");
const history = document.querySelector("[data-history]");
const operatorButtons = document.querySelectorAll('[data-action="operator"]');
const keys = document.querySelectorAll(".key");

function render() {
  const state = calculator.snapshot();

  display.textContent = state.displayValue;
  display.dataset.error = String(state.error);
  history.textContent = state.history;

  operatorButtons.forEach((button) => {
    button.classList.toggle(
      "is-active",
      state.waitingForSecondOperand && normalizeOperator(button.dataset.value) === state.operator
    );
  });
}

function runAction(action, value) {
  switch (action) {
    case "digit":
      calculator.inputDigit(value);
      break;
    case "operator":
      calculator.inputOperator(value);
      break;
    case "equals":
      calculator.calculateResult();
      break;
    case "clear":
      calculator.clear();
      break;
    default:
      return;
  }

  render();
}

keys.forEach((key) => {
  key.addEventListener("click", () => {
    runAction(key.dataset.action, key.dataset.value);
  });
});

render();
