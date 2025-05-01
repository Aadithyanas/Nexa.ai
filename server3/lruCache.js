class Node {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
    this.head = null;
    this.tail = null;
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    const node = this.cache.get(key);
    this._remove(node);
    this._add(node);
    return node.value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this._remove(this.cache.get(key));
    }
    const node = new Node(key, value);
    this._add(node);
    this.cache.set(key, node);
    if (this.cache.size > this.maxSize) {
      this.cache.delete(this.tail.key);
      this._remove(this.tail);
    }
  }

  _remove(node) {
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    if (node === this.head) this.head = node.next;
    if (node === this.tail) this.tail = node.prev;
  }

  _add(node) {
    node.next = this.head;
    node.prev = null;
    if (this.head) this.head.prev = node;
    this.head = node;
    if (!this.tail) this.tail = node;
  }

  delete(key) {
    if (!this.cache.has(key)) return;
    this._remove(this.cache.get(key));
    this.cache.delete(key);
  }

  toArray() {
    const result = [];
    let node = this.head;
    while (node) {
      result.push({ key: node.key, value: node.value });
      node = node.next;
    }
    return result;
  }
  clear() {
    this.cache.clear();
    this.head = null;
    this.tail = null;
  }
}

export default LRUCache; 