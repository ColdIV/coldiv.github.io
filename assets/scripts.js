const trigger = document.querySelector('#trigger')
const backgroundEl = document.querySelector('#background')
let triggerLocked = false
let colorIndex = 0
trigger.addEventListener('click', e => {
    if (triggerLocked) {
        return
    } else triggerLocked = true
    
    const colors = [
        '#111111',
        '#254e7b',
        '#7366A1',
        '#a17513',
        '#524737',
        '#77384B',
        '#19624c'
    ]

    colorIndex = colorIndex == colors.length - 1 ? 0 : colorIndex + 1

    backgroundEl.style.background = colors[colorIndex]

    let i = 0;
    const rootCss = document.querySelector(':root')
    let intervalID = setInterval(() => {        
        backgroundEl.style.setProperty('clip-path', 'circle(' + i + '% at 50% 50%)')
        rootCss.style.setProperty('--progress-bar', i + '%');
        
        if (i === 100) {
            backgroundEl.style.setProperty('clip-path', 'circle(0% at 50% 50%)')
            document.querySelector('body').style.background = colors[colorIndex]
            rootCss.style.setProperty('--progress-bar', '0px');
            window.clearInterval(intervalID)
            triggerLocked = false
        }
        ++i
    }, 20)
})

document.querySelectorAll('.typer').forEach(e => {
    console.log(e);
    let text = e.dataset.text
    if (text === undefined) return
    let count = 0
    let intervalID = setInterval(() => {
        if (count == text.length) {
            window.clearInterval(intervalID)
            return
        }

        if (count == 0) e.innerHTML = '' + text[count++]
        else e.innerHTML = '' + e.innerHTML + text[count++]
    }, 100)
})
