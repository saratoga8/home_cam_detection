const assert = require('chai').assert
const { promisify } = require('util')
const {sleep} = require('sleep')

const isPolindromeRec = (str, ind) => {
    if (ind >= str.length / 2) return true
    const nextInd = ind + 1
    return (str.charAt(ind) == str.charAt(str.length - nextInd)) ? isPolindromeRec(str, nextInd) : false
}

const isPolindrome = (str) => { return (str.length == 1 || str.length == 0) ? true: isPolindromeRec(str, 0) }

const strSum = (str) => {
    let res = 0
    for (let ind = 0; ind < str.length; ++ind) { res += str.charCodeAt(ind) }
    return res
}

class Node {
    constructor(val, next = null) {
        this.value = val
        this.next = next
    }

    get value() { return this._value }
    get next() { return this._next }

    set next(other) { this._next = other }
    set value(val) { this._value = val }
}

const arrToList = (arr) => {
    let last = new Node(arr.shift())
    const head = last
    arr.forEach(element => {
        const node = new Node(element)
        last.next = node
        last = node
    })
    return head
}

const printList = (head) => {
    for(let cur = head; cur != null; cur = cur.next) {
        console.log(cur.value)
    }
}

const delLast = (head) => {
    let prev = head
    for (let cur = head.next; cur.next != null; cur = cur.next) {
        prev = cur
    }
    const deleted = prev.next
    prev.next = null
    return deleted
}

const isListPalindrome = (head) => {
    if(head == null || head.next == null)
        return true
    if (head.value != delLast(head).value)
        return false
    return isListPalindrome(head.next)
}

describe('Interview questions', async () => {
    it('Palindrome', async () => {
        let str = "a"
        assert.isTrue(isPolindrome(str), `The string ${str} is Polindrome`)
        str = "aa"
        assert.isTrue(isPolindrome(str), `The string ${str} is Polindrome`)
        str = "ab"
        assert.isFalse(isPolindrome(str), `The string ${str} is Polindrome`)
        str = "aba"
        assert.isTrue(isPolindrome(str), `The string ${str} is Polindrome`)
        str = "abc"
        assert.isFalse(isPolindrome(str), `The string ${str} is Polindrome`)
        str = "abcba"
        assert.isTrue(isPolindrome(str), `The string ${str} is Polindrome`)
        str = "abba"
        assert.isTrue(isPolindrome(str), `The string ${str} is Polindrome`)
        str = "abca"
        assert.isFalse(isPolindrome(str), `The string ${str} is Polindrome`)
    })

    it('Unique chars', () => {
        const str = "abcdiefghi"
        const sortedArr = Array.from(str).sort((a, b) => { return a.charCodeAt(0) - b.charCodeAt(0) } )
        const found = sortedArr.find((ch, ind) => {
            if(ind < sortedArr.length - 1)
                return ch == sortedArr[ind + 1]
        })
        assert.isUndefined(found, "There is duplication")
    })

    it('Is permutation', () => {
        let str1 = "ab", str2 = "ba"
        let res1 =  strSum(str1), res2 =  strSum(str2)
        assert.equal(res2, res1, `Strings ${str1}, ${str2} aren't permutations because sums ${res1} != ${res2}`)
        str1 = "abc", str2 = "cba"
        res1 =  strSum(str1), res2 =  strSum(str2)
        assert.equal(res2, res1, `Strings ${str1}, ${str2} aren't permutations because sums ${res1} != ${res2}`)
        str1 = "abc", str2 = "caa"
        res1 =  strSum(str1), res2 =  strSum(str2)
        assert.notEqual(res2, res1, `Strings ${str1}, ${str2} are permutations because sums ${res1} != ${res2}`)
    })

    it('Palindrome list', () => {
        let str = "abcba"
        let head = arrToList(Array.from(str))
        assert.isTrue(isListPalindrome(head), `The string ${str} should be palindrome`)
        str = "aa"
        head = arrToList(Array.from(str))
        assert.isTrue(isListPalindrome(head), `The string ${str} should be palindrome`)
        str = "aac"
        head = arrToList(Array.from(str))
        assert.isFalse(isListPalindrome(head), `The string ${str} isn't be palindrome`)
        str = "aaccaa"
        head = arrToList(Array.from(str))
        assert.isTrue(isListPalindrome(head), `The string ${str} isn't be palindrome`)
    })

    it('Permutations', () => {
        permutations(Array.from("abc"), 0)
    })

    it("All substrings", () => {
        substrs("abcd", 4)
    })

    it('Fibbonachi', () => {
        printFibb(0, 1,0, 8)
    })
})



function permutations(arr1, fromInd) {
    if(fromInd === arr1.length - 1) {
        console.log(arr1.join(''))
        return
    }
    const arr2 = Array.from(arr1)
    for(let i = fromInd; i < arr2.length; ++i) {
        let var1 = arr1[i]
        arr2[i] = arr2[fromInd]
        arr2[fromInd] = var1
        permutations(arr2, fromInd + 1)
    }
}

function substrs(str, len) {
    if(len == 0)
        return
    for(let i = 0; i <= str.length - len; ++i)
        console.log(str.substring(i, i + len))
    substrs(str, len - 1)
}


function printFibb(first, second, curInd, lastInd) {
    if(curInd <= lastInd) {
        console.log(first + second)
        printFibb(second, first + second, curInd + 1, lastInd)
    }
}
