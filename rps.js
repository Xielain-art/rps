const aes256 = require('aes256')
const {sha3_256} = require("js-sha3")
const {randomSync} = require('pure-random-number')
const prompt = require('prompt-sync')({sigint: true})

function rps(shapes) {
    if (shapes.length < 3) {
        return new Error('The number of figures should be >= 3 \nExample: Rock , Paper, Scissors')
    }
    if (shapes.length % 2 === 0) {
        return new Error('The number of figures must be odd\nExample: Rock , Paper, Scissors')
    }
    if (!shapes.every((value, index) => shapes.lastIndexOf(value) === index)) {
        return new Error('The entered shapes must be unique\nExample: Rock , Paper, Scissors')
    }
    let computerChoice = generateChoice(shapes.length - 1)
    console.log(computerChoice)
    let key = sha3_256(String(computerChoice))
    let HMAC = generateHMAC(key, String(shapes[computerChoice]))

    console.log(`HMAC ${HMAC}`)
    let moves = generateMoves(shapes)
    console.log(generateMenu(shapes, moves))
    let playerChoice
    let flag = false
    while (!flag) {
        playerChoice = choice(prompt('Enter your move: '), moves)
        if (playerChoice === '?') {
            console.table(generateHelpTable(shapes))
        }
        flag = moves.some((move) => move === +playerChoice)
    }

    console.log(whoWin(shapes, playerChoice, computerChoice))
    console.log(`KEY ${key}`)
}

const generateChoice = (max) => {
    return randomSync(0, max)
}
const generateHMAC = (key, choice) => {
    return aes256.encrypt(key, choice)
}
const generateHelpTable = (shapes) => {
    const t = {}
    shapes.forEach((shape, index) => {
        t[shape] = {}
    })
    for (let i = 0; i < shapes.length; i++) {
        t[shapes[i]] = {}
        for (let j = 0; j < shapes.length; j++) {
            t[shapes[i]][shapes[j]] = whoWin(shapes, i, j)
        }
    }
    return t
}


const generateMenu = (shapes, moves) => {
    let choices = moves.map((move) => {
        return `${move} - ${shapes[move - 1]}`
    }).join('\n')
    let menu = `Available moves:\n${choices} \n0 - exit\n? - help`
    return menu
}
const generateMoves = (shapes) => {
    let moves = shapes.map((value, index) => {
        return index + 1
    })
    return moves
}

const choice = (choice, moves) => {
    if (choice === '?') {
        return choice
    }
    if (choice === '0') {
        process.exit()
    }
    if (moves.some((move) => move.toString() === choice)) {
        return choice
    }
    return false
}

const whoWin = (shapes, playerChoice, computerChoice) => {
    if (computerChoice === playerChoice) {
        return 'Draw'
    }
    let half = (shapes.length - 1) / 2
    if (playerChoice > computerChoice) {
        if (playerChoice - computerChoice <= half) {
            return 'You lose!'
        }
        return 'You win!'
    }
    if (computerChoice - playerChoice <= half) {
        return 'You win!'
    }
    return 'You lose!'
}


rps(process.argv.slice(2))

