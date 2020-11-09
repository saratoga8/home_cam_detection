const assert = require('chai').assert


class Tree {
    #root

    constructor(node) {
        this.#root = node
    }

    add(cur, node) {
        if (node.data > cur.data) {
            if (cur.right !== null)
                return this.add(cur.right, node)
            else
                cur.right = node
        } else {
            if (cur.left !== null)
                return this.add(cur.left, node)
            else
                cur.left = node
        }
    }

    #findParent(parent, cur, node) {
        if (cur === null)
            return parent
        return (node.data > cur.data) ? this.#findParent(cur, cur.right, node) : this.#findParent(cur, cur.left, node)
    }

    get root() {
        return this.#root
    }


    printTree(node) {
        if (node !== null) {
            this.printTree(node.left)
            console.log(node.data)
            this.printTree(node.right)
        }
    }

    toArray(node) {
        if (node !== null) {
            console.log(node.data)
            this.toArray(node.left)
            this.toArray(node.right)
        }
    }

    height(node, height) {
        if (node === null)
            return height - 1
        const lHight = this.height(node.left, height + 1)
        const rHight = this.height(node.right, height + 1)
        return lHight > rHight ? lHight :  rHight
    }
}

class Node {
    #data
    #_left = null
    #_right = null

    constructor(data) {
        this.#data = data
    }


    get left() {
        return this.#_left;
    }

    set left(value) {
        this.#_left = value;
    }

    get right() {
        return this.#_right;
    }

    set right(value) {
        this.#_right = value;
    }

    get data() {
        return this.#data;
    }
}

describe('Interview questions', async () => {
    it('BTS', async () => {
        const root = new Node(8)
        assert.equal(root.data, 8)
        const tree = new Tree(root)
        assert.equal(tree.root.data, 8)
        tree.add(tree.root, new Node(10))
        tree.add(tree.root, new Node(3))
        tree.add(tree.root, new Node(1))
        tree.add(tree.root, new Node(14))
        tree.add(tree.root, new Node(13))
        tree.add(tree.root, new Node(6))
        tree.add(tree.root, new Node(4))
        tree.add(tree.root, new Node(7))
        tree.printTree(tree.root)
        tree.toArray(tree.root)
        console.log(tree.height(tree.root, 0))
    })
})

function sortBinary(arr) {
    
}