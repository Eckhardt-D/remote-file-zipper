class QueueProcessor {
  constructor() {
    this.items = [];
  }

  enqueue(item) {
    this.items.push(item);
  }

  divideAndEnqueueList(list, subListSize) {
    for (let i = 0; i < list.length; i += subListSize) {
      this.enqueue(list.slice(i, i + subListSize));
    }
  }

  processHead() {
    return this.items.shift();
  }

  getQueue() {
    return this.items.map((item) => item).reverse();
  }

  length() {
    return this.items.length;
  }

  isFullyProcessed() {
    return this.items.length === 0;
  }
}

module.exports = QueueProcessor;
