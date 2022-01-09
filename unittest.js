/* a simple test cases registration and execution */
window.test = new class {
    constructor() { this.cases = []; }
    add(f) { this.cases.push(f); }
    run() { this.cases.forEach(f => f()); }
};
window.assert = console.assert;
